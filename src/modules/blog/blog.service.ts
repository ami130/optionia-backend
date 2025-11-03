// src/modules/blog/blog.service.ts
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, ILike } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Page } from '../pages/entities/page.entity';
import { Category } from '../categories/entities/category.entity';
import { User } from 'src/users/entities/user.entity';
import { Tag } from '../tag/entities/tag.entity';
import { slugify } from 'src/common/config/slugify';
import { UploadsService } from '../uploads/uploads.service';
import { PaginationService } from 'src/common/services/pagination.service';
import { PaginatedResponse } from 'src/common/interfaces/pagination.interface';
import { BlogFilterDto } from './dto/blog-query.dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog) private blogRepo: Repository<Blog>,
    @InjectRepository(Page) private pageRepo: Repository<Page>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Tag) private tagRepo: Repository<Tag>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private readonly uploadsService: UploadsService,
    private readonly paginationService: PaginationService,
  ) {}

  async create(data: CreateBlogDto, user?: User) {
    // ✅ Check if page exists
    const page = await this.pageRepo.findOne({ where: { id: data.pageId } });
    if (!page) throw new NotFoundException(`Page with ID ${data.pageId} not found`);

    // ✅ Check if category exists
    const category = await this.categoryRepo.findOne({ where: { id: data.categoryId } });
    if (!category) throw new NotFoundException(`Category with ID ${data.categoryId} not found`);

    // ✅ Check if tags exist
    let tags: Tag[] = [];
    if (data.tagIds?.length) {
      tags = await this.tagRepo.find({ where: { id: In(data.tagIds) } });
      const foundTagIds = tags.map((t) => t.id);
      const invalidTagIds = data.tagIds.filter((id) => !foundTagIds.includes(id));
      if (invalidTagIds.length) {
        throw new NotFoundException(`Tags not found with IDs: ${invalidTagIds.join(', ')}`);
      }
    }

    // ✅ Check if authors exist
    let authors: User[] = [];
    if (data.authorIds?.length) {
      authors = await this.userRepo.find({ where: { id: In(data.authorIds) } });
      const foundAuthorIds = authors.map((a) => a.id);
      const invalidAuthorIds = data.authorIds.filter((id) => !foundAuthorIds.includes(id));
      if (invalidAuthorIds.length) {
        throw new NotFoundException(`Authors not found with IDs: ${invalidAuthorIds.join(', ')}`);
      }
    }

    // ✅ Generate slug
    const slug = slugify(data.title) || data.slug?.trim();

    // ✅ Check for duplicate slug
    const existingBlog = await this.blogRepo.findOne({ where: { slug } });
    if (existingBlog) throw new ConflictException(`A blog with slug "${slug}" already exists`);

    // ✅ Create blog entity
    const blog = this.blogRepo.create({
      ...data,
      slug,
      page,
      category,
      tags,
      authors,
      createdBy: user,
    });

    // ✅ Save blog
    const savedBlog = await this.blogRepo.save(blog);

    // ✅ Prepare OpenGraph and Twitter metadata
    const metaTitle = savedBlog?.metaData.metaTitle || savedBlog.title;
    const metaDescription =
      savedBlog?.metaData?.metaDescription ||
      savedBlog.subtitle ||
      savedBlog.content?.substring(0, 160) ||
      'Explore this blog on Optionia.';
    const pageUrl = `https://optionia.com${page.url.startsWith('/') ? page.url : '/' + page.url}`;

    const openGraph = {
      title: metaTitle,
      description: metaDescription,
      url: pageUrl,
      type: 'website',
    };

    const twitter = {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
    };

    // ✅ Transform for response
    return {
      id: savedBlog.id,
      title: savedBlog.title,
      slug: savedBlog.slug,
      subtitle: savedBlog.subtitle,
      content: savedBlog.content,
      page: {
        id: page.id,
        name: page.name,
        url: page.url,
      },
      category: {
        id: category.id,
        name: category.name,
      },
      authors: authors.map((a) => ({
        id: a.id,
        username: a.username,
        email: a.email,
        profileImage: a.profileImage,
      })),
      tags: tags.map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
      metaTitle,
      metaDescription,
      metaKeywords: savedBlog?.metaData?.metaKeywords || [],
      metaImage: savedBlog?.metaData?.metaImage,
      openGraph,
      twitter,
      createdBy: user
        ? {
            id: user.id,
            username: user.username,
            email: user.email,
            profileImage: user.profileImage,
          }
        : null,
      createdAt: savedBlog.createdAt,
      updatedAt: savedBlog.updatedAt,
    };
  }

  // Update your getAll method in blog.service.ts
  async getAll(filters: BlogFilterDto): Promise<PaginatedResponse<Blog>> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = filters;
    const skip = (page - 1) * limit;

    // Create query builder for flexible filtering
    const queryBuilder = this.blogRepo
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.category', 'category')
      .leftJoinAndSelect('blog.page', 'page')
      .leftJoinAndSelect('blog.authors', 'authors')
      .leftJoinAndSelect('blog.tags', 'tags')
      .leftJoinAndSelect('blog.createdBy', 'createdBy');

    // Add search condition across title, subtitle, and content
    if (search) {
      queryBuilder.andWhere('(blog.title ILIKE :search OR blog.subtitle ILIKE :search OR blog.content ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    // Add category filter
    if (filters.category) {
      queryBuilder.andWhere('category.id = :categoryId', { categoryId: filters.category });
    }

    // Add author filter (many-to-many relationship)
    if (filters.author) {
      queryBuilder.andWhere('authors.id = :authorId', { authorId: filters.author });
    }

    // Add blogType filter
    if (filters.blogType) {
      queryBuilder.andWhere('blog.blogType = :blogType', { blogType: filters.blogType });
    }

    // Add featured filter
    if (filters.featured !== undefined) {
      queryBuilder.andWhere('blog.featured = :featured', { featured: filters.featured });
    }

    // Add status filter
    if (filters.status) {
      queryBuilder.andWhere('blog.status = :status', { status: filters.status });
    }

    // ✅ FIXED: Add tags filter by ID (like category)
    if (filters.tagIds) {
      const tagIds = filters.tagIds.split(',').map((id) => parseInt(id.trim()));
      queryBuilder.andWhere('tags.id IN (:...tagIds)', { tagIds });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination and ordering
    const data = await queryBuilder.orderBy(`blog.${sortBy}`, sortOrder).skip(skip).take(limit).getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  // ✅ ADVANCED SEARCH
  async searchBlogs(filters: BlogFilterDto) {
    return this.getAll(filters);
  }

  // update
  async update(
    id: number,
    data: UpdateBlogDto,
    files?: Express.Multer.File[],
    imageIndexMap?: Record<string, number>,
    user?: User,
  ) {
    const blog = await this.blogRepo.findOne({
      where: { id },
      relations: ['authors', 'tags', 'category', 'page', 'createdBy'],
    });
    if (!blog) throw new NotFoundException('Blog not found');

    if (data.pageId) {
      const page = await this.pageRepo.findOne({ where: { id: data.pageId } });
      if (!page) throw new NotFoundException('Page not found');
      blog.page = page;
    }

    if (data.categoryId) {
      const category = await this.categoryRepo.findOne({ where: { id: data.categoryId } });
      if (!category) throw new NotFoundException('Category not found');
      blog.category = category;
    }

    if (data.authorIds?.length) {
      const authors = await this.userRepo.find({ where: { id: In(data.authorIds) } });
      if (authors.length !== data.authorIds.length) {
        throw new BadRequestException('Some authorIds are invalid');
      }
      blog.authors = authors;
    }

    if (data.tagIds?.length) {
      const tags = await this.tagRepo.find({ where: { id: In(data.tagIds) } });
      if (tags.length !== data.tagIds.length) {
        throw new BadRequestException('Some tagIds are invalid');
      }
      blog.tags = tags;
    }

    if (files?.length) {
      this.uploadsService.mapFilesToData(files, data as any, ['thumbnailUrl', 'image'], blog, {
        arrayIndex: imageIndexMap,
      });
    }

    if (data.title && data.title !== blog.title) {
      blog.slug = data.slug || slugify(data.title);
    }

    Object.assign(blog, data);

    if (user) {
      blog.createdBy = user;
    }

    const updatedBlog = await this.blogRepo.save(blog);

    return {
      ...updatedBlog,
      page: updatedBlog.page.name,
      createdBy: updatedBlog.createdBy
        ? {
            id: updatedBlog.createdBy.id,
            username: updatedBlog.createdBy.username,
            email: updatedBlog.createdBy.email,
            profileImage: updatedBlog.createdBy.profileImage,
          }
        : null,
      tags: updatedBlog.tags?.map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
      authors: updatedBlog.authors?.map((a) => ({
        id: a.id,
        username: a.username,
        email: a.email,
        profileImage: a.profileImage,
      })),
    };
  }

  // delete
  async delete(id: number) {
    const blog = await this.blogRepo.findOne({ where: { id } });
    if (!blog) throw new NotFoundException('Blog not found');
    return this.blogRepo.remove(blog);
  }

  async getById(id: number) {
    const blog = await this.blogRepo.findOne({
      where: { id },
      relations: ['category', 'page', 'authors', 'tags', 'createdBy'],
    });

    if (!blog) throw new NotFoundException('Blog not found');

    // Build OpenGraph and Twitter meta
    const metaTitle = blog.metaData?.metaTitle || blog.title;
    const metaDescription =
      blog.metaData?.metaDescription ||
      blog.subtitle ||
      blog.content?.substring(0, 160) ||
      'Explore this blog on Optionia.';
    const pageUrl = `https://optionia.com/${blog.page?.slug || 'blog'}`;

    const openGraph = {
      title: metaTitle,
      description: metaDescription,
      url: pageUrl,
      type: 'website',
    };

    const twitter = {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
    };

    // Return clean response
    return {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      subtitle: blog.subtitle,
      content: blog.content,
      thumbnailUrl: blog.thumbnailUrl,
      image: blog.image,
      metaData: blog.metaData,
      readingTime: blog.readingTime,
      wordCount: blog.wordCount,
      featured: blog.featured,
      blogType: blog.blogType,
      status: blog.status,
      page: blog.page
        ? {
            id: blog.page.id,
            name: blog.page.name,
            slug: blog.page.slug,
          }
        : null,
      category: blog.category
        ? {
            id: blog.category.id,
            name: blog.category.name,
            slug: blog.category.slug,
          }
        : null,
      tags: blog.tags?.map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
      authors: blog.authors?.map((a) => ({
        id: a.id,
        username: a.username,
        email: a.email,
        profileImage: a.profileImage,
      })),
      createdBy: blog.createdBy
        ? {
            id: blog.createdBy.id,
            username: blog.createdBy.username,
            email: blog.createdBy.email,
            profileImage: blog.createdBy.profileImage,
          }
        : null,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      openGraph,
      twitter,
    };
  }

  // Add this method to your BlogService
  async getBySlug(slug: string) {
    const blog = await this.blogRepo.findOne({
      where: { slug },
      relations: ['category', 'page', 'authors', 'tags', 'createdBy'],
    });

    if (!blog) throw new NotFoundException(`Blog with slug "${slug}" not found`);

    // Build OpenGraph and Twitter meta
    const metaTitle = blog.metaData?.metaTitle || blog.title;
    const metaDescription =
      blog.metaData?.metaDescription ||
      blog.subtitle ||
      blog.content?.substring(0, 160) ||
      'Explore this blog on Optionia.';
    const pageUrl = `https://optionia.com/${blog.page?.slug || 'blog'}/${blog.slug}`;

    const openGraph = {
      title: metaTitle,
      description: metaDescription,
      url: pageUrl,
      type: 'article', // Changed to 'article' for individual blog posts
      image: blog.thumbnailUrl || blog.image?.[0], // Use thumbnail or first image
    };

    const twitter = {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      image: blog.thumbnailUrl || blog.image?.[0],
    };

    // Return clean response
    return {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      subtitle: blog.subtitle,
      content: blog.content,
      thumbnailUrl: blog.thumbnailUrl,
      image: blog.image,
      metaData: blog.metaData,
      readingTime: blog.readingTime,
      wordCount: blog.wordCount,
      featured: blog.featured,
      blogType: blog.blogType,
      status: blog.status,
      page: blog.page
        ? {
            id: blog.page.id,
            name: blog.page.name,
            slug: blog.page.slug,
          }
        : null,
      category: blog.category
        ? {
            id: blog.category.id,
            name: blog.category.name,
            slug: blog.category.slug,
          }
        : null,
      tags: blog.tags?.map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
      authors: blog.authors?.map((a) => ({
        id: a.id,
        username: a.username,
        email: a.email,
        profileImage: a.profileImage,
      })),
      createdBy: blog.createdBy
        ? {
            id: blog.createdBy.id,
            username: blog.createdBy.username,
            email: blog.createdBy.email,
            profileImage: blog.createdBy.profileImage,
          }
        : null,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      openGraph,
      twitter,
    };
  }

  // ✅ GET BLOG PAGE WITH BLOGS
  async getBlogPage(filters: BlogFilterDto) {
    try {
      // Find the blog page
      const page = await this.pageRepo.findOne({
        where: { url: 'blog', isActive: true },
      });

      if (!page) {
        return await this.createDefaultBlogPage();
      }

      // Get blogs with pagination and filters
      const blogsResponse = await this.getAll(filters);

      // Transform blogs to include OpenGraph & Twitter metadata
      const blogs = blogsResponse.data.map((blog) => {
        const metaTitle = blog.metaData?.metaTitle || blog.title;
        const metaDescription =
          blog.metaData?.metaDescription ||
          blog.subtitle ||
          (blog.content ? blog.content.replace(/<[^>]+>/g, '').substring(0, 160) : '');
        const blogUrl = `https://optionia.com/${blog.slug}`;

        const openGraph = {
          title: metaTitle,
          description: metaDescription,
          url: blogUrl,
          type: 'website',
        };

        const twitter = {
          card: 'summary_large_image',
          title: metaTitle,
          description: metaDescription,
        };

        return {
          id: blog.id,
          title: blog.title,
          slug: blog.slug,
          subtitle: blog.subtitle,
          content: blog.content,
          thumbnailUrl: blog.thumbnailUrl,
          image: blog.image,
          metaData: blog.metaData,
          readingTime: blog.readingTime,
          wordCount: blog.wordCount,
          featured: blog.featured,
          blogType: blog.blogType,
          status: blog.status,
          page: blog.page
            ? {
                id: blog.page.id,
                name: blog.page.name,
                slug: blog.page.slug,
              }
            : null,
          category: blog.category
            ? {
                id: blog.category.id,
                name: blog.category.name,
                slug: blog.category.slug,
              }
            : null,
          tags: blog.tags?.map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
          authors: blog.authors?.map((a) => ({
            id: a.id,
            username: a.username,
            email: a.email,
            profileImage: a.profileImage,
          })),
          createdBy: blog.createdBy
            ? {
                id: blog.createdBy.id,
                username: blog.createdBy.username,
                email: blog.createdBy.email,
                profileImage: blog.createdBy.profileImage,
              }
            : null,
          createdAt: blog.createdAt,
          updatedAt: blog.updatedAt,
          openGraph,
          twitter,
        };
      });

      return {
        page,
        blogs,
        pagination: blogsResponse.meta,
      };
    } catch (error) {
      console.error('Error in getBlogPage:', error);
      throw error;
    }
  }

  private async createDefaultBlogPage() {
    const blogPage = this.pageRepo.create({
      name: 'blog',
      title: 'Our Blog',
      url: 'blog',
      slug: 'blog',
      isActive: true,
      navbarShow: true,
      type: 'blog',
      description: 'Latest articles and insights from our team',
      metaTitle: 'Our Blog | Latest Articles',
      metaDescription: 'Explore our latest blog posts and articles',
      order: 2,
    });

    const savedPage = await this.pageRepo.save(blogPage);

    return {
      page: {
        name: savedPage.name,
        title: savedPage.title,
        description: savedPage.description,
      },
      blogs: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
}

// import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository, In, ILike } from 'typeorm';
// import { Blog } from './entities/blog.entity';
// import { CreateBlogDto } from './dto/create-blog.dto';
// import { UpdateBlogDto } from './dto/update-blog.dto';
// import { Page } from '../pages/entities/page.entity';
// import { Category } from '../categories/entities/category.entity';
// import { User } from 'src/users/entities/user.entity';
// import { Tag } from '../tag/entities/tag.entity';
// import { slugify } from 'src/common/config/slugify';
// import { UploadsService } from '../uploads/uploads.service';
// import { PaginationService } from 'src/common/services/pagination.service';
// import { PaginatedResponse } from 'src/common/interfaces/pagination.interface';
// import { BlogFilterDto } from './dto/blog-query.dto';

// @Injectable()
// export class BlogService {
//   constructor(
//     @InjectRepository(Blog) private blogRepo: Repository<Blog>,
//     @InjectRepository(Page) private pageRepo: Repository<Page>,
//     @InjectRepository(Category) private categoryRepo: Repository<Category>,
//     @InjectRepository(Tag) private tagRepo: Repository<Tag>,
//     @InjectRepository(User) private userRepo: Repository<User>,
//     private readonly uploadsService: UploadsService,
//     private readonly paginationService: PaginationService,
//   ) {}

//   async create(data: CreateBlogDto, user?: User) {
//     // ✅ Check if page exists
//     const page = await this.pageRepo.findOne({ where: { id: data.pageId } });
//     if (!page) throw new NotFoundException(`Page with ID ${data.pageId} not found`);

//     // ✅ Check if category exists
//     const category = await this.categoryRepo.findOne({ where: { id: data.categoryId } });
//     if (!category) throw new NotFoundException(`Category with ID ${data.categoryId} not found`);

//     // ✅ Check if tags exist
//     let tags: Tag[] = [];
//     if (data.tagIds?.length) {
//       tags = await this.tagRepo.find({ where: { id: In(data.tagIds) } });
//       const foundTagIds = tags.map((t) => t.id);
//       const invalidTagIds = data.tagIds.filter((id) => !foundTagIds.includes(id));
//       if (invalidTagIds.length) {
//         throw new NotFoundException(`Tags not found with IDs: ${invalidTagIds.join(', ')}`);
//       }
//     }

//     // ✅ Check if authors exist
//     let authors: User[] = [];
//     if (data.authorIds?.length) {
//       authors = await this.userRepo.find({ where: { id: In(data.authorIds) } });
//       const foundAuthorIds = authors.map((a) => a.id);
//       const invalidAuthorIds = data.authorIds.filter((id) => !foundAuthorIds.includes(id));
//       if (invalidAuthorIds.length) {
//         throw new NotFoundException(`Authors not found with IDs: ${invalidAuthorIds.join(', ')}`);
//       }
//     }

//     // ✅ Generate slug
//     const slug = slugify(data.title) || data.slug?.trim();

//     // ✅ Check for duplicate slug
//     const existingBlog = await this.blogRepo.findOne({ where: { slug } });
//     if (existingBlog) throw new ConflictException(`A blog with slug "${slug}" already exists`);

//     // ✅ Create blog entity
//     const blog = this.blogRepo.create({
//       ...data,
//       slug,
//       page,
//       category,
//       tags,
//       authors,
//       createdBy: user,
//     });

//     // ✅ Save blog
//     const savedBlog = await this.blogRepo.save(blog);

//     // ✅ Transform for response
//     return {
//       ...savedBlog,
//       page: savedBlog.page.name, // only show page name
//       createdBy: savedBlog.createdBy
//         ? {
//             id: savedBlog.createdBy.id,
//             username: savedBlog.createdBy.username,
//             email: savedBlog.createdBy.email,
//             profileImage: savedBlog.createdBy.profileImage,
//           }
//         : null,
//     };
//   }

//   // ✅ GET ALL WITH PAGINATION & FILTERS
//   async getAll(filters: BlogFilterDto): Promise<PaginatedResponse<Blog>> {
//     type SearchOperator = 'equals' | 'in' | 'like' | 'gt' | 'lt';
//     const searchFilters: { field: string; value: any; operator: SearchOperator }[] = [];

//     // Add category filter
//     if (filters.category) {
//       searchFilters.push({ field: 'category', value: filters.category, operator: 'equals' });
//     }

//     // Add author filter
//     if (filters.author) {
//       searchFilters.push({ field: 'authors', value: filters.author, operator: 'equals' });
//     }

//     // Add blogType filter
//     if (filters.blogType) {
//       searchFilters.push({ field: 'blogType', value: filters.blogType, operator: 'equals' });
//     }

//     // Add featured filter
//     if (filters.featured !== undefined) {
//       searchFilters.push({ field: 'featured', value: filters.featured, operator: 'equals' });
//     }

//     // Add status filter
//     if (filters.status) {
//       searchFilters.push({ field: 'status', value: filters.status, operator: 'equals' });
//     }

//     // Add tags filter (special handling for many-to-many)
//     if (filters.tags) {
//       const tagNames = filters.tags.split(',');
//       // This requires custom handling - we'll use advancedPaginate for this
//       return this.getBlogsByTags(filters, tagNames);
//     }

//     return this.paginationService.paginate(
//       this.blogRepo,
//       filters,
//       searchFilters,
//       ['category', 'page', 'authors', 'tags', 'createdBy'],
//       'createdAt',
//       'DESC',
//     );
//   }

//   // ✅ SPECIAL HANDLING FOR TAGS FILTER
//   private async getBlogsByTags(filters: BlogFilterDto, tagNames: string[]): Promise<PaginatedResponse<Blog>> {
//     const { page = 1, limit = 1, search, sortBy, sortOrder } = filters;
//     const skip = (page - 1) * limit;

//     // Create query builder for many-to-many relationship
//     const queryBuilder = this.blogRepo
//       .createQueryBuilder('blog')
//       .leftJoinAndSelect('blog.category', 'category')
//       .leftJoinAndSelect('blog.page', 'page')
//       .leftJoinAndSelect('blog.authors', 'authors')
//       .leftJoinAndSelect('blog.tags', 'tags')
//       .leftJoinAndSelect('blog.createdBy', 'createdBy')
//       .where('tags.name IN (:...tagNames)', { tagNames });

//     // Add search condition
//     if (search) {
//       queryBuilder.andWhere('(blog.title ILIKE :search OR blog.subtitle ILIKE :search OR blog.content ILIKE :search)', {
//         search: `%${search}%`,
//       });
//     }

//     // Add other filters
//     if (filters.category) {
//       queryBuilder.andWhere('category.id = :categoryId', { categoryId: filters.category });
//     }

//     if (filters.author) {
//       queryBuilder.andWhere('authors.id = :authorId', { authorId: filters.author });
//     }

//     if (filters.blogType) {
//       queryBuilder.andWhere('blog.blogType = :blogType', { blogType: filters.blogType });
//     }

//     if (filters.featured !== undefined) {
//       queryBuilder.andWhere('blog.featured = :featured', { featured: filters.featured });
//     }

//     if (filters.status) {
//       queryBuilder.andWhere('blog.status = :status', { status: filters.status });
//     }

//     // Get total count
//     const total = await queryBuilder.getCount();

//     // Apply pagination and ordering
//     const data = await queryBuilder
//       .orderBy(`blog.${sortBy || 'createdAt'}`, sortOrder || 'DESC')
//       .skip(skip)
//       .take(limit)
//       .getMany();

//     const totalPages = Math.ceil(total / limit);

//     return {
//       data,
//       meta: {
//         total,
//         page,
//         limit,
//         totalPages,
//         hasNext: page < totalPages,
//         hasPrev: page > 1,
//       },
//     };
//   }

//   // ✅ ADVANCED SEARCH
//   async searchBlogs(filters: BlogFilterDto) {
//     return this.getAll(filters);
//   }

//   async update(
//     id: number,
//     data: UpdateBlogDto,
//     files?: Express.Multer.File[],
//     imageIndexMap?: Record<string, number>,
//     user?: User,
//   ) {
//     // ... keep your existing update method unchanged
//     const blog = await this.blogRepo.findOne({
//       where: { id },
//       relations: ['authors', 'tags', 'category', 'page', 'createdBy'],
//     });
//     if (!blog) throw new NotFoundException('Blog not found');

//     // ... rest of your update logic
//     if (data.pageId) {
//       const page = await this.pageRepo.findOne({ where: { id: data.pageId } });
//       if (!page) throw new NotFoundException('Page not found');
//       blog.page = page;
//     }

//     if (data.categoryId) {
//       const category = await this.categoryRepo.findOne({ where: { id: data.categoryId } });
//       if (!category) throw new NotFoundException('Category not found');
//       blog.category = category;
//     }

//     if (data.authorIds?.length) {
//       const authors = await this.userRepo.find({ where: { id: In(data.authorIds) } });
//       if (authors.length !== data.authorIds.length) {
//         throw new BadRequestException('Some authorIds are invalid');
//       }
//       blog.authors = authors;
//     }

//     if (data.tagIds?.length) {
//       const tags = await this.tagRepo.find({ where: { id: In(data.tagIds) } });
//       if (tags.length !== data.tagIds.length) {
//         throw new BadRequestException('Some tagIds are invalid');
//       }
//       blog.tags = tags;
//     }

//     if (files?.length) {
//       this.uploadsService.mapFilesToData(files, data as any, ['thumbnailUrl', 'image'], blog, {
//         arrayIndex: imageIndexMap,
//       });
//     }

//     if (data.title && data.title !== blog.title) {
//       blog.slug = data.slug || slugify(data.title);
//     }

//     Object.assign(blog, data);

//     if (user) {
//       blog.createdBy = user;
//     }

//     const updatedBlog = await this.blogRepo.save(blog);

//     return {
//       ...updatedBlog,
//       page: updatedBlog.page.name,
//       createdBy: updatedBlog.createdBy
//         ? {
//             id: updatedBlog.createdBy.id,
//             username: updatedBlog.createdBy.username,
//             email: updatedBlog.createdBy.email,
//             profileImage: updatedBlog.createdBy.profileImage,
//           }
//         : null,
//       tags: updatedBlog.tags?.map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
//       authors: updatedBlog.authors?.map((a) => ({
//         id: a.id,
//         username: a.username,
//         email: a.email,
//         profileImage: a.profileImage,
//       })),
//     };
//   }

//   async delete(id: number) {
//     const blog = await this.blogRepo.findOne({ where: { id } });
//     if (!blog) throw new NotFoundException('Blog not found');
//     return this.blogRepo.remove(blog);
//   }

//   async getById(id: number) {
//     const blog = await this.blogRepo.findOne({
//       where: { id },
//       relations: ['category', 'page', 'authors', 'tags'],
//     });
//     if (!blog) throw new NotFoundException('Blog not found');

//     const related = await this.blogRepo.find({
//       where: { category: { id: blog.category.id } },
//       take: 3,
//       order: { createdAt: 'DESC' },
//     });

//     return {
//       blog,
//       related: related.filter((r) => r.id !== blog.id).slice(0, 3),
//     };
//   }

//   // Add this method to your BlogService
//   async getBlogPage(filters: BlogFilterDto) {
//     try {
//       console.log('🔍 Getting blog page with blogs...');

//       // Find the blog page
//       const page = await this.pageRepo.findOne({
//         where: {
//           url: 'blog',
//           isActive: true,
//         },
//       });

//       if (!page) {
//         console.log('❌ Blog page not found, creating default...');
//         return await this.createDefaultBlogPage();
//       }

//       console.log('✅ Found blog page:', {
//         id: page.id,
//         name: page.name,
//         url: page.url,
//       });

//       // Get blogs with pagination and filters
//       const blogsResponse = await this.getAll(filters);

//       return {
//         page: {
//           name: page.name,
//           title: page.title,
//           subtitle: page.subtitle,
//           description: page.description,
//           backgroundImage: page.backgroundImage,
//           backgroundColor: page.backgroundColor,
//           textColor: page.textColor,
//           metadata: page.type,
//           metaDescription: page.metaDescription,
//           metaKeywords: page.metaKeywords,
//           canonicalUrl: page.canonicalUrl,
//           metaImage: page.metaImage,
//         },
//         blogs: blogsResponse.data,
//         pagination: blogsResponse.meta,
//       };
//     } catch (error) {
//       console.error('💥 Error in getBlogPageWithBlogs:', error);
//       throw error;
//     }
//   }
// }
