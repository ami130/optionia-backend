// src/modules/blog/blog.service.ts
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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

  // ✅ CREATE BLOG
  async create(data: CreateBlogDto, user?: User, files?: Express.Multer.File[]) {
    console.log('=== DEBUG START ===');
    console.log('📝 Original data:', data);
    console.log('🎯 Featured value:', data.featured);
    console.log('🎯 Status value:', data.status);

    // ✅ Handle uploaded files using the existing UploadsService
    if (files?.length) {
      const allowedFields = ['thumbnail', 'image'];
      const fileData: any = {};

      this.uploadsService.mapFilesToData(files, fileData, allowedFields);

      // Convert field names to match your entity
      if (fileData['thumbnail']) {
        data.thumbnailUrl = fileData['thumbnail'];
      }

      // Handle multiple images
      if (fileData['image']) {
        data.image = Array.isArray(fileData['image']) ? fileData['image'] : [fileData['image']];
      }
    }

    // ✅ Set defaults if not provided
    const featured = data.featured !== undefined ? data.featured : false;
    const status = data.status !== undefined ? data.status : true;

    console.log('🎯 Final values - Featured:', featured, 'Status:', status);

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

    // ✅ Create blog entity with file URLs and proper boolean values
    const blog = this.blogRepo.create({
      ...data,
      slug,
      featured: data.featured, // Should be boolean now
      status: data.status,
      page,
      category,
      tags,
      authors,
      createdBy: user,
    });

    // ✅ Save blog
    const savedBlog = await this.blogRepo.save(blog);
    console.log('💾 Saved blog - Featured:', savedBlog.featured, 'Status:', savedBlog.status);

    return this.transformBlogResponse(savedBlog);
  }

  // ✅ GET ALL BLOGS WITH FILTERS AND PAGINATION
  async getAll(filters: BlogFilterDto): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = filters;
    const skip = (page - 1) * limit;

    console.log('🔍 Filters received:', filters);

    // Create query builder for flexible filtering
    const queryBuilder = this.blogRepo
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.category', 'category')
      .leftJoinAndSelect('blog.page', 'page')
      .leftJoinAndSelect('blog.authors', 'authors')
      .leftJoinAndSelect('blog.tags', 'tags')
      .leftJoinAndSelect('blog.createdBy', 'createdBy');

    // ✅ CHANGED: Only filter by status if explicitly provided
    if (filters.status !== undefined) {
      console.log('🎯 Filtering by status:', filters.status);
      queryBuilder.andWhere('blog.status = :status', { status: filters.status });
    }
    // ✅ If status not provided, show ALL blogs (no status filter)

    // Add search condition across title, subtitle, and content
    if (search) {
      queryBuilder.andWhere('(blog.title ILIKE :search OR blog.subtitle ILIKE :search OR blog.content ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    // ✅ FIXED: Add category filter by slug
    if (filters.category) {
      queryBuilder.andWhere('category.slug = :categorySlug', { categorySlug: filters.category });
    }

    // Add author filter (many-to-many relationship)
    if (filters.author) {
      queryBuilder.andWhere('authors.id = :authorId', { authorId: filters.author });
    }

    // Add blogType filter
    if (filters.blogType) {
      queryBuilder.andWhere('blog.blogType = :blogType', { blogType: filters.blogType });
    }

    // ✅ FIXED: Featured filter - handle boolean properly
    if (filters.featured !== undefined) {
      console.log('🎯 Filtering by featured:', filters.featured);
      queryBuilder.andWhere('blog.featured = :featured', { featured: filters.featured });
    }

    // ✅ FIXED: Add tags filter by slug instead of ID
    if (filters.tagSlugs) {
      const tagSlugs = filters.tagSlugs.split(',').map((slug) => slug.trim());
      queryBuilder.andWhere('tags.slug IN (:...tagSlugs)', { tagSlugs });
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

    console.log('📊 Blogs found:', data.length);
    console.log(
      '🎯 Featured values in results:',
      data.map((blog) => ({ id: blog.id, featured: blog.featured, status: blog.status })),
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map((blog) => this.transformBlogResponse(blog)),
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

  // ✅ UPDATE BLOG
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

    console.log('🔄 Update data received:', data);
    console.log('📝 Current blog - Featured:', blog.featured, 'Status:', blog.status);

    // ✅ Handle boolean fields properly
    if (data.featured !== undefined) {
      blog.featured = data.featured;
      console.log('✅ Updated featured to:', data.featured);
    }

    if (data.status !== undefined) {
      blog.status = data.status;
      console.log('✅ Updated status to:', data.status);
    }

    // ✅ Handle page update
    if (data.pageId) {
      const page = await this.pageRepo.findOne({ where: { id: data.pageId } });
      if (!page) throw new NotFoundException('Page not found');
      blog.page = page;
    }

    // ✅ Handle category update
    if (data.categoryId) {
      const category = await this.categoryRepo.findOne({ where: { id: data.categoryId } });
      if (!category) throw new NotFoundException('Category not found');
      blog.category = category;
    }

    // ✅ Handle authors update
    if (data.authorIds?.length) {
      const authors = await this.userRepo.find({ where: { id: In(data.authorIds) } });
      if (authors.length !== data.authorIds.length) {
        throw new BadRequestException('Some authorIds are invalid');
      }
      blog.authors = authors;
    }

    // ✅ Handle tags update
    if (data.tagIds?.length) {
      const tags = await this.tagRepo.find({ where: { id: In(data.tagIds) } });
      if (tags.length !== data.tagIds.length) {
        throw new BadRequestException('Some tagIds are invalid');
      }
      blog.tags = tags;
    }

    // ✅ Handle file uploads with imageIndexMap for specific image replacement
    if (files?.length) {
      // Prepare the existing data structure for mapFilesToData
      const existingData = {
        thumbnailUrl: blog.thumbnailUrl,
        image: blog.image || [],
      };

      // Use the UploadsService to handle file mapping with index replacement
      this.uploadsService.mapFilesToData(files, data as any, ['thumbnailUrl', 'image'], existingData, {
        arrayIndex: imageIndexMap,
      });

      // Apply the file changes to the blog entity
      if (data.thumbnailUrl !== undefined) {
        blog.thumbnailUrl = data.thumbnailUrl;
      }

      if (data.image !== undefined) {
        blog.image = data.image;
      }
    }

    // ✅ Handle slug update if title changed
    if (data.title && data.title !== blog.title) {
      blog.slug = data.slug || slugify(data.title);
    }

    // ✅ Update other fields
    Object.assign(blog, data);

    // ✅ Update createdBy if user provided
    if (user) {
      blog.createdBy = user;
    }

    // ✅ Save updated blog
    const updatedBlog = await this.blogRepo.save(blog);
    console.log('💾 After update - Featured:', updatedBlog.featured, 'Status:', updatedBlog.status);

    return this.transformBlogResponse(updatedBlog);
  }

  // ✅ DELETE BLOG
  async delete(id: number) {
    const blog = await this.blogRepo.findOne({ where: { id } });
    if (!blog) throw new NotFoundException('Blog not found');

    // Optional: Delete associated files
    if (blog.thumbnailUrl) {
      const fullPath = '.' + blog.thumbnailUrl;
      try {
        if (require('fs').existsSync(fullPath)) {
          require('fs').unlinkSync(fullPath);
        }
      } catch (error) {
        console.warn('Could not delete thumbnail file:', error);
      }
    }

    if (blog.image?.length) {
      blog.image.forEach((img) => {
        const fullPath = '.' + img;
        try {
          if (require('fs').existsSync(fullPath)) {
            require('fs').unlinkSync(fullPath);
          }
        } catch (error) {
          console.warn('Could not delete image file:', error);
        }
      });
    }

    return this.blogRepo.remove(blog);
  }

  // ✅ GET RELATED BLOGS BY CATEGORY
  private async getRelatedBlogs(currentBlogId: number, categoryId?: number, limit: number = 3) {
    if (!categoryId) {
      return []; // No category, no related blogs
    }

    try {
      const relatedBlogs = await this.blogRepo
        .createQueryBuilder('blog')
        .leftJoinAndSelect('blog.category', 'category')
        .leftJoinAndSelect('blog.authors', 'authors')
        .leftJoinAndSelect('blog.tags', 'tags')
        .where('blog.category = :categoryId', { categoryId })
        .andWhere('blog.id != :currentBlogId', { currentBlogId })
        .andWhere('blog.status = :status', { status: true }) // ✅ Only published blogs for related
        .orderBy('blog.featured', 'DESC') // ✅ Featured first
        .addOrderBy('blog.createdAt', 'DESC') // Then latest
        .take(limit)
        .getMany();

      return relatedBlogs.map((blog) => this.transformBlogResponse(blog));
    } catch (error) {
      console.error('Error fetching related blogs:', error);
      return [];
    }
  }

  // ✅ GET BLOG BY SLUG
  async getBySlug(slug: string) {
    const blog = await this.blogRepo.findOne({
      where: { slug },
      relations: ['category', 'page', 'authors', 'tags', 'createdBy'],
    });

    if (!blog) throw new NotFoundException(`Blog with slug "${slug}" not found`);

    // ✅ GET RELATED BLOGS (same category, excluding current blog)
    const relatedBlogs = await this.getRelatedBlogs(blog.id, blog.category?.id, 3);

    const transformedBlog = this.transformBlogResponse(blog);

    // ✅ ADD RELATED BLOGS TO RESPONSE
    return {
      ...transformedBlog,
      relatedBlogs,
    };
  }

  // ✅ GET BLOG BY ID
  async getById(id: number) {
    const blog = await this.blogRepo.findOne({
      where: { id },
      relations: ['category', 'page', 'authors', 'tags', 'createdBy'],
    });

    if (!blog) throw new NotFoundException('Blog not found');

    // ✅ GET RELATED BLOGS (same category, excluding current blog)
    const relatedBlogs = await this.getRelatedBlogs(blog.id, blog.category?.id, 3);

    const transformedBlog = this.transformBlogResponse(blog);

    // ✅ ADD RELATED BLOGS TO RESPONSE
    return {
      ...transformedBlog,
      relatedBlogs,
    };
  }

  // ✅ GET BLOG PAGE WITH BLOGS
  async getBlogPage(filters: BlogFilterDto) {
    try {
      console.log('🔍 Getting blog page...');

      // ✅ Find existing blog page with multiple fallbacks
      let page = await this.pageRepo.findOne({
        where: { url: '/blog', isActive: true },
      });

      // If not found by URL, try by slug
      if (!page) {
        page = await this.pageRepo.findOne({
          where: { slug: 'blog', isActive: true },
        });
      }

      const blogsResponse = await this.getAll(filters);
      const blogs = blogsResponse.data.map((blog) => this.transformBlogResponse(blog));

      // ✅ If no page exists, use virtual page
      if (!page) {
        console.log('ℹ️ No blog page found, using virtual page');

        const virtualPage = {
          id: 0,
          name: 'Blog',
          title: 'Blog - Optionia',
          description: 'Read our latest blog posts and articles',
          slug: 'blog',
          url: '/blog',
          subtitle: null,
          navbarShow: true,
          order: 0,
          isActive: true,
          type: 'blog',
          content: null,
          metaTitle: 'Blog - Optionia',
          metaDescription: 'Read our latest blog posts and articles',
          metaKeywords: ['blog', 'articles', 'posts'],
          canonicalUrl: '/blog',
          metaImage: null,
          backgroundImage: null,
          backgroundColor: null,
          textColor: null,
          metaData: {
            metaTitle: 'Blog - Optionia',
            metaDescription: 'Read our latest blog posts and articles',
            keywords: ['blog', 'articles', 'posts'],
          },
          parentId: null,
          parent: null,
          children: [],
          blogs: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        return {
          page: virtualPage,
          blogs,
          pagination: blogsResponse.meta,
        };
      }

      // ✅ Page exists, use it
      console.log('✅ Using existing blog page:', page.id);

      return {
        page: { ...page }, // Spread all page properties
        blogs,
        pagination: blogsResponse.meta,
      };
    } catch (error) {
      console.error('❌ Error in getBlogPage:', error);

      // ✅ Safe fallback
      const fallbackPage = {
        id: 0,
        name: 'Blog',
        title: 'Blog - Optionia',
        description: 'Read our latest blog posts and articles',
        slug: 'blog',
        url: '/blog',
        subtitle: null,
        navbarShow: true,
        order: 0,
        isActive: true,
        type: 'blog',
        content: null,
        metaTitle: 'Blog - Optionia',
        metaDescription: 'Read our latest blog posts and articles',
        metaKeywords: ['blog', 'articles', 'posts'],
        canonicalUrl: '/blog',
        metaImage: null,
        backgroundImage: null,
        backgroundColor: null,
        textColor: null,
        metaData: {
          metaTitle: 'Blog - Optionia',
          metaDescription: 'Read our latest blog posts and articles',
          keywords: ['blog', 'articles', 'posts'],
        },
        parentId: null,
        parent: null,
        children: [],
        blogs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return {
        page: fallbackPage,
        blogs: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };
    }
  }

  // ✅ PRIVATE HELPER METHODS
  private transformBlogResponse(blog: Blog) {
    const metaTitle = blog.metaData?.metaTitle || blog.title;
    const metaDescription =
      blog.metaData?.metaDescription ||
      blog.subtitle ||
      (blog.content ? blog.content.replace(/<[^>]+>/g, '').substring(0, 160) : '') ||
      'Explore this blog on Optionia.';

    const pageUrl = `https://optionia.com/${blog.page?.slug || 'blog'}/${blog.slug}`;

    const openGraph = {
      title: metaTitle,
      description: metaDescription,
      url: pageUrl,
      type: 'article',
      image: blog.thumbnailUrl || blog.image?.[0],
    };

    const twitter = {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      image: blog.thumbnailUrl || blog.image?.[0],
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
      featured: blog.featured, // ✅ Boolean value
      blogType: blog.blogType,
      status: blog.status, // ✅ Boolean value
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

  // ✅ BULK OPERATIONS (Optional)
  async bulkDelete(ids: number[]) {
    const blogs = await this.blogRepo.find({ where: { id: In(ids) } });

    if (blogs.length !== ids.length) {
      throw new NotFoundException('Some blogs not found');
    }

    // Delete associated files
    blogs.forEach((blog) => {
      if (blog.thumbnailUrl) {
        const fullPath = '.' + blog.thumbnailUrl;
        try {
          if (require('fs').existsSync(fullPath)) {
            require('fs').unlinkSync(fullPath);
          }
        } catch (error) {
          console.warn('Could not delete thumbnail file:', error);
        }
      }

      if (blog.image?.length) {
        blog.image.forEach((img) => {
          const fullPath = '.' + img;
          try {
            if (require('fs').existsSync(fullPath)) {
              require('fs').unlinkSync(fullPath);
            }
          } catch (error) {
            console.warn('Could not delete image file:', error);
          }
        });
      }
    });

    return this.blogRepo.remove(blogs);
  }

  async updateStatus(id: number, status: boolean) {
    const blog = await this.blogRepo.findOne({ where: { id } });
    if (!blog) throw new NotFoundException('Blog not found');

    blog.status = status;
    return this.blogRepo.save(blog);
  }

  async toggleFeatured(id: number) {
    const blog = await this.blogRepo.findOne({ where: { id } });
    if (!blog) throw new NotFoundException('Blog not found');

    blog.featured = !blog.featured;
    return this.blogRepo.save(blog);
  }
}

// // src/modules/blog/blog.service.ts
// import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository, In } from 'typeorm';
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

//   // ✅ CREATE BLOG
//   async create(data: CreateBlogDto, user?: User, files?: Express.Multer.File[]) {
//     console.log('=== DEBUG START ===');
//     console.log('📝 Original data:', data);
//     console.log(
//       '📁 Files received:',
//       files?.map((f) => ({
//         fieldname: f.fieldname,
//         filename: f.filename,
//         originalname: f.originalname,
//       })),
//     );

//     // ✅ Handle uploaded files using the existing UploadsService
//     if (files?.length) {
//       const allowedFields = ['thumbnail', 'image'];

//       // Create a temporary object to avoid modifying the original data directly
//       const fileData: any = {};

//       // Map files to the temporary object
//       this.uploadsService.mapFilesToData(files, fileData, allowedFields);

//       console.log('🔄 File data after mapFilesToData:', fileData);

//       // Convert field names to match your entity
//       if (fileData['thumbnail']) {
//         data.thumbnailUrl = fileData['thumbnail'];
//         console.log('✅ Thumbnail URL set:', data.thumbnailUrl);
//       }

//       // Handle multiple images
//       if (fileData['image']) {
//         if (Array.isArray(fileData['image'])) {
//           data.image = fileData['image'];
//         } else {
//           data.image = [fileData['image']]; // Convert single image to array
//         }
//         console.log('✅ Images set:', data.image);
//       } else {
//         console.log('❌ No images found in fileData');
//       }
//     }

//     console.log('🎯 Final data before save:', {
//       thumbnailUrl: data.thumbnailUrl,
//       image: data.image,
//     });
//     console.log('=== DEBUG END ===');

//     // ... rest of your existing create method
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

//     // ✅ Create blog entity with file URLs
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

//     // ✅ Return the complete response including file URLs
//     return this.transformBlogResponse(savedBlog);
//   }

//   // In BlogService - update getAll method
//   async getAll(filters: BlogFilterDto): Promise<PaginatedResponse<any>> {
//     const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = filters;
//     const skip = (page - 1) * limit;

//     console.log('🔍 Filters received:', filters);

//     // Create query builder for flexible filtering
//     const queryBuilder = this.blogRepo
//       .createQueryBuilder('blog')
//       .leftJoinAndSelect('blog.category', 'category')
//       .leftJoinAndSelect('blog.page', 'page')
//       .leftJoinAndSelect('blog.authors', 'authors')
//       .leftJoinAndSelect('blog.tags', 'tags')
//       .leftJoinAndSelect('blog.createdBy', 'createdBy');

//     // ✅ CHANGED: Only filter by status if explicitly provided
//     if (filters.status !== undefined) {
//       console.log('🎯 Filtering by status:', filters.status);
//       queryBuilder.andWhere('blog.status = :status', { status: filters.status });
//     }
//     // ✅ If status not provided, show ALL blogs (no status filter)

//     // Add search condition across title, subtitle, and content
//     if (search) {
//       queryBuilder.andWhere('(blog.title ILIKE :search OR blog.subtitle ILIKE :search OR blog.content ILIKE :search)', {
//         search: `%${search}%`,
//       });
//     }

//     // ✅ FIXED: Add category filter by slug
//     if (filters.category) {
//       queryBuilder.andWhere('category.slug = :categorySlug', { categorySlug: filters.category });
//     }

//     // Add author filter (many-to-many relationship)
//     if (filters.author) {
//       queryBuilder.andWhere('authors.id = :authorId', { authorId: filters.author });
//     }

//     // Add blogType filter
//     if (filters.blogType) {
//       queryBuilder.andWhere('blog.blogType = :blogType', { blogType: filters.blogType });
//     }

//     // ✅ FIXED: Featured filter - handle boolean properly
//     if (filters.featured !== undefined) {
//       console.log('🎯 Filtering by featured:', filters.featured);
//       queryBuilder.andWhere('blog.featured = :featured', { featured: filters.featured });
//     }

//     // ✅ FIXED: Add tags filter by slug instead of ID
//     if (filters.tagSlugs) {
//       const tagSlugs = filters.tagSlugs.split(',').map((slug) => slug.trim());
//       queryBuilder.andWhere('tags.slug IN (:...tagSlugs)', { tagSlugs });
//     }

//     // ✅ FIXED: Add tags filter by ID (like category)
//     if (filters.tagIds) {
//       const tagIds = filters.tagIds.split(',').map((id) => parseInt(id.trim()));
//       queryBuilder.andWhere('tags.id IN (:...tagIds)', { tagIds });
//     }

//     // Debug the final query
//     console.log('📝 Final query conditions:', queryBuilder.getQueryAndParameters());

//     // Get total count
//     const total = await queryBuilder.getCount();

//     // Apply pagination and ordering
//     const data = await queryBuilder.orderBy(`blog.${sortBy}`, sortOrder).skip(skip).take(limit).getMany();

//     console.log('📊 Blogs found:', data.length);
//     console.log(
//       '🎯 Featured values in results:',
//       data.map((blog) => ({ id: blog.id, featured: blog.featured, status: blog.status })),
//     );

//     const totalPages = Math.ceil(total / limit);

//     return {
//       data: data.map((blog) => this.transformBlogResponse(blog)),
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

//   // ✅ UPDATE BLOG
//   async update(
//     id: number,
//     data: UpdateBlogDto,
//     files?: Express.Multer.File[],
//     imageIndexMap?: Record<string, number>,
//     user?: User,
//   ) {
//     const blog = await this.blogRepo.findOne({
//       where: { id },
//       relations: ['authors', 'tags', 'category', 'page', 'createdBy'],
//     });
//     if (!blog) throw new NotFoundException('Blog not found');

//     // ✅ Handle page update
//     if (data.pageId) {
//       const page = await this.pageRepo.findOne({ where: { id: data.pageId } });
//       if (!page) throw new NotFoundException('Page not found');
//       blog.page = page;
//     }

//     // ✅ Handle category update
//     if (data.categoryId) {
//       const category = await this.categoryRepo.findOne({ where: { id: data.categoryId } });
//       if (!category) throw new NotFoundException('Category not found');
//       blog.category = category;
//     }

//     // ✅ Handle authors update
//     if (data.authorIds?.length) {
//       const authors = await this.userRepo.find({ where: { id: In(data.authorIds) } });
//       if (authors.length !== data.authorIds.length) {
//         throw new BadRequestException('Some authorIds are invalid');
//       }
//       blog.authors = authors;
//     }

//     // ✅ Handle tags update
//     if (data.tagIds?.length) {
//       const tags = await this.tagRepo.find({ where: { id: In(data.tagIds) } });
//       if (tags.length !== data.tagIds.length) {
//         throw new BadRequestException('Some tagIds are invalid');
//       }
//       blog.tags = tags;
//     }

//     // ✅ Handle file uploads with imageIndexMap for specific image replacement
//     if (files?.length) {
//       // Prepare the existing data structure for mapFilesToData
//       const existingData = {
//         thumbnailUrl: blog.thumbnailUrl,
//         image: blog.image || [],
//       };

//       // Use the UploadsService to handle file mapping with index replacement
//       this.uploadsService.mapFilesToData(files, data as any, ['thumbnailUrl', 'image'], existingData, {
//         arrayIndex: imageIndexMap,
//       });

//       // Apply the file changes to the blog entity
//       if (data.thumbnailUrl !== undefined) {
//         blog.thumbnailUrl = data.thumbnailUrl;
//       }

//       if (data.image !== undefined) {
//         blog.image = data.image;
//       }
//     }

//     // ✅ Handle slug update if title changed
//     if (data.title && data.title !== blog.title) {
//       blog.slug = data.slug || slugify(data.title);
//     }

//     // ✅ Update other fields
//     Object.assign(blog, data);

//     // ✅ Update createdBy if user provided
//     if (user) {
//       blog.createdBy = user;
//     }

//     // ✅ Save updated blog
//     const updatedBlog = await this.blogRepo.save(blog);

//     // ✅ Return transformed response
//     return this.transformBlogResponse(updatedBlog);
//   }

//   // ✅ DELETE BLOG
//   async delete(id: number) {
//     const blog = await this.blogRepo.findOne({ where: { id } });
//     if (!blog) throw new NotFoundException('Blog not found');

//     // Optional: Delete associated files
//     if (blog.thumbnailUrl) {
//       const fullPath = '.' + blog.thumbnailUrl;
//       try {
//         if (require('fs').existsSync(fullPath)) {
//           require('fs').unlinkSync(fullPath);
//         }
//       } catch (error) {
//         console.warn('Could not delete thumbnail file:', error);
//       }
//     }

//     if (blog.image?.length) {
//       blog.image.forEach((img) => {
//         const fullPath = '.' + img;
//         try {
//           if (require('fs').existsSync(fullPath)) {
//             require('fs').unlinkSync(fullPath);
//           }
//         } catch (error) {
//           console.warn('Could not delete image file:', error);
//         }
//       });
//     }

//     return this.blogRepo.remove(blog);
//   }
//   // ✅ GET RELATED BLOGS BY CATEGORY
//   private async getRelatedBlogs(currentBlogId: number, categoryId?: number, limit: number = 3) {
//     if (!categoryId) {
//       return []; // No category, no related blogs
//     }

//     try {
//       const relatedBlogs = await this.blogRepo
//         .createQueryBuilder('blog')
//         .leftJoinAndSelect('blog.category', 'category')
//         .leftJoinAndSelect('blog.authors', 'authors')
//         .leftJoinAndSelect('blog.tags', 'tags')
//         .where('blog.category = :categoryId', { categoryId })
//         .andWhere('blog.id != :currentBlogId', { currentBlogId })
//         .andWhere('blog.status = :status', { status: 'published' }) // Only published blogs
//         .orderBy('blog.createdAt', 'DESC') // Latest first
//         .take(limit)
//         .getMany();

//       return relatedBlogs.map((blog) => this.transformBlogResponse(blog));
//     } catch (error) {
//       console.error('Error fetching related blogs:', error);
//       return [];
//     }
//   }

//   // ✅ GET BLOG BY SLUG
//   async getBySlug(slug: string) {
//     const blog = await this.blogRepo.findOne({
//       where: { slug },
//       relations: ['category', 'page', 'authors', 'tags', 'createdBy'],
//     });

//     if (!blog) throw new NotFoundException(`Blog with slug "${slug}" not found`);

//     // ✅ GET RELATED BLOGS (same category, excluding current blog)
//     const relatedBlogs = await this.getRelatedBlogs(blog.id, blog.category?.id, 3);

//     const transformedBlog = this.transformBlogResponse(blog);

//     // ✅ ADD RELATED BLOGS TO RESPONSE
//     return {
//       ...transformedBlog,
//       relatedBlogs,
//     };
//   }

//   async getById(id: number) {
//     const blog = await this.blogRepo.findOne({
//       where: { id },
//       relations: ['category', 'page', 'authors', 'tags', 'createdBy'],
//     });

//     if (!blog) throw new NotFoundException('Blog not found');

//     // ✅ GET RELATED BLOGS (same category, excluding current blog)
//     const relatedBlogs = await this.getRelatedBlogs(blog.id, blog.category?.id, 3);

//     const transformedBlog = this.transformBlogResponse(blog);

//     // ✅ ADD RELATED BLOGS TO RESPONSE
//     return {
//       ...transformedBlog,
//       relatedBlogs,
//     };
//   }

//   // ✅ GET BLOG PAGE WITH BLOGS
//   async getBlogPage(filters: BlogFilterDto) {
//     try {
//       console.log('🔍 Getting blog page...');

//       // ✅ Find existing blog page with multiple fallbacks
//       let page = await this.pageRepo.findOne({
//         where: { url: '/blog', isActive: true },
//       });

//       // If not found by URL, try by slug
//       if (!page) {
//         page = await this.pageRepo.findOne({
//           where: { slug: 'blog', isActive: true },
//         });
//       }

//       const blogsResponse = await this.getAll(filters);
//       const blogs = blogsResponse.data.map((blog) => this.transformBlogResponse(blog));

//       // ✅ If no page exists, use virtual page
//       if (!page) {
//         console.log('ℹ️ No blog page found, using virtual page');

//         const virtualPage = {
//           id: 0,
//           name: 'Blog',
//           title: 'Blog - Optionia',
//           description: 'Read our latest blog posts and articles',
//           slug: 'blog',
//           url: '/blog',
//           subtitle: null,
//           navbarShow: true,
//           order: 0,
//           isActive: true,
//           type: 'blog',
//           content: null,
//           metaTitle: 'Blog - Optionia',
//           metaDescription: 'Read our latest blog posts and articles',
//           metaKeywords: ['blog', 'articles', 'posts'],
//           canonicalUrl: '/blog',
//           metaImage: null,
//           backgroundImage: null,
//           backgroundColor: null,
//           textColor: null,
//           metaData: {
//             metaTitle: 'Blog - Optionia',
//             metaDescription: 'Read our latest blog posts and articles',
//             keywords: ['blog', 'articles', 'posts'],
//           },
//           parentId: null,
//           parent: null,
//           children: [],
//           blogs: [],
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         };

//         return {
//           page: virtualPage,
//           blogs,
//           pagination: blogsResponse.meta,
//         };
//       }

//       // ✅ Page exists, use it
//       console.log('✅ Using existing blog page:', page.id);

//       return {
//         page: { ...page }, // Spread all page properties
//         blogs,
//         pagination: blogsResponse.meta,
//       };
//     } catch (error) {
//       console.error('❌ Error in getBlogPage:', error);

//       // ✅ Safe fallback
//       const fallbackPage = {
//         id: 0,
//         name: 'Blog',
//         title: 'Blog - Optionia',
//         description: 'Read our latest blog posts and articles',
//         slug: 'blog',
//         url: '/blog',
//         subtitle: null,
//         navbarShow: true,
//         order: 0,
//         isActive: true,
//         type: 'blog',
//         content: null,
//         metaTitle: 'Blog - Optionia',
//         metaDescription: 'Read our latest blog posts and articles',
//         metaKeywords: ['blog', 'articles', 'posts'],
//         canonicalUrl: '/blog',
//         metaImage: null,
//         backgroundImage: null,
//         backgroundColor: null,
//         textColor: null,
//         metaData: {
//           metaTitle: 'Blog - Optionia',
//           metaDescription: 'Read our latest blog posts and articles',
//           keywords: ['blog', 'articles', 'posts'],
//         },
//         parentId: null,
//         parent: null,
//         children: [],
//         blogs: [],
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };

//       return {
//         page: fallbackPage,
//         blogs: [],
//         pagination: {
//           page: 1,
//           limit: 10,
//           total: 0,
//           totalPages: 0,
//         },
//       };
//     }
//   }

//   // ✅ PRIVATE HELPER METHODS
//   private transformBlogResponse(blog: Blog) {
//     const metaTitle = blog.metaData?.metaTitle || blog.title;
//     const metaDescription =
//       blog.metaData?.metaDescription ||
//       blog.subtitle ||
//       (blog.content ? blog.content.replace(/<[^>]+>/g, '').substring(0, 160) : '') ||
//       'Explore this blog on Optionia.';

//     const pageUrl = `https://optionia.com/${blog.page?.slug || 'blog'}/${blog.slug}`;

//     const openGraph = {
//       title: metaTitle,
//       description: metaDescription,
//       url: pageUrl,
//       type: 'article',
//       image: blog.thumbnailUrl || blog.image?.[0],
//     };

//     const twitter = {
//       card: 'summary_large_image',
//       title: metaTitle,
//       description: metaDescription,
//       image: blog.thumbnailUrl || blog.image?.[0],
//     };

//     return {
//       id: blog.id,
//       title: blog.title,
//       slug: blog.slug,
//       subtitle: blog.subtitle,
//       content: blog.content,
//       thumbnailUrl: blog.thumbnailUrl,
//       image: blog.image,
//       metaData: blog.metaData,
//       readingTime: blog.readingTime,
//       wordCount: blog.wordCount,
//       featured: blog.featured,
//       blogType: blog.blogType,
//       status: blog.status,
//       page: blog.page
//         ? {
//             id: blog.page.id,
//             name: blog.page.name,
//             slug: blog.page.slug,
//           }
//         : null,
//       category: blog.category
//         ? {
//             id: blog.category.id,
//             name: blog.category.name,
//             slug: blog.category.slug,
//           }
//         : null,
//       tags: blog.tags?.map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
//       authors: blog.authors?.map((a) => ({
//         id: a.id,
//         username: a.username,
//         email: a.email,
//         profileImage: a.profileImage,
//       })),
//       createdBy: blog.createdBy
//         ? {
//             id: blog.createdBy.id,
//             username: blog.createdBy.username,
//             email: blog.createdBy.email,
//             profileImage: blog.createdBy.profileImage,
//           }
//         : null,
//       createdAt: blog.createdAt,
//       updatedAt: blog.updatedAt,
//       openGraph,
//       twitter,
//     };
//   }

//   // ✅ BULK OPERATIONS (Optional)
//   async bulkDelete(ids: number[]) {
//     const blogs = await this.blogRepo.find({ where: { id: In(ids) } });

//     if (blogs.length !== ids.length) {
//       throw new NotFoundException('Some blogs not found');
//     }

//     // Delete associated files
//     blogs.forEach((blog) => {
//       if (blog.thumbnailUrl) {
//         const fullPath = '.' + blog.thumbnailUrl;
//         try {
//           if (require('fs').existsSync(fullPath)) {
//             require('fs').unlinkSync(fullPath);
//           }
//         } catch (error) {
//           console.warn('Could not delete thumbnail file:', error);
//         }
//       }

//       if (blog.image?.length) {
//         blog.image.forEach((img) => {
//           const fullPath = '.' + img;
//           try {
//             if (require('fs').existsSync(fullPath)) {
//               require('fs').unlinkSync(fullPath);
//             }
//           } catch (error) {
//             console.warn('Could not delete image file:', error);
//           }
//         });
//       }
//     });

//     return this.blogRepo.remove(blogs);
//   }

//   async updateStatus(id: number, status: string) {
//     const blog = await this.blogRepo.findOne({ where: { id } });
//     if (!blog) throw new NotFoundException('Blog not found');

//     blog.status = status;
//     return this.blogRepo.save(blog);
//   }

//   async toggleFeatured(id: number) {
//     const blog = await this.blogRepo.findOne({ where: { id } });
//     if (!blog) throw new NotFoundException('Blog not found');

//     blog.featured = !blog.featured;
//     return this.blogRepo.save(blog);
//   }
// }
