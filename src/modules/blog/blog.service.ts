// src/modules/blog/blog.service.ts
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Brackets } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Page } from '../pages/entities/page.entity';
import { Category } from '../categories/entities/category.entity';
import { User } from 'src/users/entities/user.entity';
import { Tag } from '../tag/entities/tag.entity';
import { UploadsService } from '../uploads/uploads.service';
import { PaginationService } from 'src/common/services/pagination.service';
import { PaginatedResponse } from 'src/common/interfaces/pagination.interface';
import { BlogFilterDto } from './dto/blog-query.dto';
import { slugify } from 'src/common/config/slugify';

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
  // async create(data: CreateBlogDto, user?: User, files?: Express.Multer.File[]) {
  //   console.log('=== DEBUG START ===');
  //   console.log('📝 Original data:', data);
  //   console.log('🎯 Featured value:', data.featured);
  //   console.log('🎯 Status value:', data.status);

  //   // ✅ Handle uploaded files using the existing UploadsService
  //   const uploadedFiles: any = {};
  //   // ✅ Handle file uploads with imageIndexMap for specific image replacement
  //   if (files?.length) {
  //     const allowedFields = ['thumbnail', 'image', 'promotional_image'];
  //     const fileData: any = {};

  //     this.uploadsService.mapFilesToData(files, fileData, allowedFields);

  //     // Apply the file changes to the blog entity
  //     if (fileData['thumbnail']) {
  //       data.thumbnailUrl = fileData['thumbnail'];
  //     }

  //     if (fileData['image']) {
  //       data.image = Array.isArray(fileData['image']) ? fileData['image'] : [fileData['image']];
  //     }

  //     // Handle promotional image
  //     if (fileData['promotional_image']) {
  //       if (!data.promotionalData) {
  //         data.promotionalData = data.promotionalData || {
  //           title: '',
  //           keywords: [],
  //           promotional_url: '',
  //           image: fileData['promotional_image'],
  //         };
  //       } else {
  //         data.promotionalData.image = fileData['promotional_image'];
  //       }
  //     }
  //   }

  //   // ✅ Handle promotional_content from form data
  //   if ((data as any).promotional_content) {
  //     try {
  //       const promotionalContent = JSON.parse((data as any).promotional_content);
  //       data.promotionalData = {
  //         ...data.promotionalData,
  //         ...promotionalContent,
  //         // If we have uploaded promotional image, add it here
  //         ...(uploadedFiles.promotional_image && { image: uploadedFiles.promotional_image }),
  //       };
  //     } catch (error) {
  //       console.warn('Failed to parse promotional_content:', error);
  //     }
  //   }

  //   // ✅ Handle faqData from form data
  //   if ((data as any).faqData) {
  //     try {
  //       const faqData = JSON.parse((data as any).faqData);
  //       data.faqData = faqData;
  //     } catch (error) {
  //       console.warn('Failed to parse faqData:', error);
  //     }
  //   }

  //   // ✅ Set defaults if not provided
  //   const featured = data.featured === true || ['true', '1'].includes(String(data.featured));
  //   const status = data.status === true || ['true', '1', 'published'].includes(String(data.status));

  //   console.log('🎯 Final values - Featured:', featured, 'Status:', status);
  //   console.log('📊 Promotional Data:', data.promotionalData);
  //   console.log('❓ FAQ Data:', data.faqData);

  //   // ✅ Check if page exists
  //   const page = await this.pageRepo.findOne({ where: { id: data.pageId } });
  //   if (!page) throw new NotFoundException(`Page with ID ${data.pageId} not found`);

  //   // ✅ Check if category exists
  //   const category = await this.categoryRepo.findOne({ where: { id: data.categoryId } });
  //   if (!category) throw new NotFoundException(`Category with ID ${data.categoryId} not found`);

  //   // ✅ Check if tags exist
  //   let tags: Tag[] = [];
  //   if (data.tagIds?.length) {
  //     tags = await this.tagRepo.find({ where: { id: In(data.tagIds) } });
  //     const foundTagIds = tags.map((t) => t.id);
  //     const invalidTagIds = data.tagIds.filter((id) => !foundTagIds.includes(id));
  //     if (invalidTagIds.length) {
  //       throw new NotFoundException(`Tags not found with IDs: ${invalidTagIds.join(', ')}`);
  //     }
  //   }

  //   // ✅ Check if authors exist
  //   let authors: User[] = [];
  //   if (data.authorIds?.length) {
  //     authors = await this.userRepo.find({ where: { id: In(data.authorIds) } });
  //     const foundAuthorIds = authors.map((a) => a.id);
  //     const invalidAuthorIds = data.authorIds.filter((id) => !foundAuthorIds.includes(id));
  //     if (invalidAuthorIds.length) {
  //       throw new NotFoundException(`Authors not found with IDs: ${invalidAuthorIds.join(', ')}`);
  //     }
  //   }

  //   // ✅ Generate slug
  //   const slug = data?.slug ? data?.slug : slugify(data.title) || data.slug?.trim();

  //   // ✅ Check for duplicate slug
  //   const existingBlog = await this.blogRepo.findOne({ where: { slug } });
  //   if (existingBlog) throw new ConflictException(`A blog with slug "${slug}" already exists`);

  //   // ✅ Create blog entity with file URLs and proper boolean values
  //   const blog = this.blogRepo.create({
  //     ...data,
  //     slug,
  //     featured: featured, // Use the fixed boolean
  //     status: status,
  //     page,
  //     category,
  //     tags,
  //     authors,
  //     createdBy: user,
  //     // Ensure promotionalData and faqData are properly set
  //     promotionalData: data.promotionalData,
  //     faqData: data.faqData,
  //   });

  //   // ✅ Save blog
  //   const savedBlog = await this.blogRepo.save(blog);
  //   console.log('💾 Saved blog - Featured:', savedBlog.featured, 'Status:', savedBlog.status);
  //   console.log('💾 Saved promotionalData:', savedBlog.promotionalData);
  //   console.log('💾 Saved faqData:', savedBlog.faqData);

  //   return this.transformBlogResponse(savedBlog);
  // }

  // ✅ CREATE BLOG
  async create(data: CreateBlogDto, user?: User, files?: Express.Multer.File[]) {
    console.log('=== DEBUG START ===');
    console.log('📝 Original data:', data);
    console.log(
      '📁 Files received:',
      files?.map((f) => ({ fieldname: f.fieldname, originalname: f.originalname })),
    );

    // ✅ Fix boolean parsing
    const featured = data.featured === true || ['true', '1'].includes(String(data.featured));
    const status = data.status === true || ['true', '1', 'published'].includes(String(data.status));

    // ✅ Handle promotionalData JSON - IMPROVED PARSING
    let parsedPromotionalData: any = { title: '', keywords: [], promotional_url: '', image: '' };
    if (data.promotionalData) {
      if (typeof data.promotionalData === 'string') {
        try {
          const parsed = JSON.parse(data.promotionalData);
          parsedPromotionalData = Object.assign(
            {},
            parsedPromotionalData,
            parsed && typeof parsed === 'object' ? parsed : {},
          );
          console.log('✅ Parsed promotionalData from string:', parsedPromotionalData);
        } catch (error) {
          console.warn('Failed to parse promotionalData:', error);
          // If parsing fails, try to handle it as object or keep defaults
          if (data.promotionalData && typeof data.promotionalData === 'object') {
            parsedPromotionalData = Object.assign(
              {},
              parsedPromotionalData,
              data.promotionalData as Record<string, any>,
            );
          }
        }
      } else if (data.promotionalData && typeof data.promotionalData === 'object') {
        parsedPromotionalData = Object.assign({}, parsedPromotionalData, data.promotionalData as Record<string, any>);
      }
    }

    // ✅ Handle faqData JSON - IMPROVED PARSING
    let parsedFaqData: any = { faqTitle: '', items: [] };
    if (data.faqData) {
      if (typeof data.faqData === 'string') {
        try {
          parsedFaqData = { ...parsedFaqData, ...JSON.parse(data.faqData) };
          console.log('✅ Parsed faqData from string:', parsedFaqData);
        } catch (error) {
          console.warn('Failed to parse faqData:', error);
          // Only merge if it's truly an object at runtime
          if (data.faqData && typeof data.faqData === 'object') {
            parsedFaqData = { ...parsedFaqData, ...(data.faqData as Record<string, any>) };
          }
        }
      } else if (data.faqData && typeof data.faqData === 'object') {
        parsedFaqData = { ...parsedFaqData, ...(data.faqData as Record<string, any>) };
      }
    }

    // ✅ Handle uploaded files
    if (files?.length) {
      const allowedFields = ['thumbnail', 'image', 'promotional_image'];
      const fileData: any = {};

      this.uploadsService.mapFilesToData(files, fileData, allowedFields);

      console.log('📁 Processed files:', fileData);

      // Apply file changes
      if (fileData['thumbnail']) {
        data.thumbnailUrl = fileData['thumbnail'];
        console.log('✅ Thumbnail set to:', data.thumbnailUrl);
      }

      if (fileData['image']) {
        data.image = Array.isArray(fileData['image']) ? fileData['image'] : [fileData['image']];
        console.log('✅ Images set to:', data.image);
      }

      // Handle promotional image - FIXED
      if (fileData['promotional_image']) {
        console.log('✅ Promotional image found:', fileData['promotional_image']);
        parsedPromotionalData.image = fileData['promotional_image'];
      }
    }

    console.log('🎯 Final values - Featured:', featured, 'Status:', status);
    console.log('📊 Promotional Data:', parsedPromotionalData);
    console.log('❓ FAQ Data:', parsedFaqData);

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
    const slug = data?.slug ? data?.slug : slugify(data.title) || data.slug?.trim();

    // ✅ Check for duplicate slug
    const existingBlog = await this.blogRepo.findOne({ where: { slug } });
    if (existingBlog) throw new ConflictException(`A blog with slug "${slug}" already exists`);

    // ✅ Create blog entity with proper data structure
    const blog = this.blogRepo.create({
      ...data,
      slug,
      featured: featured,
      status: status,
      page,
      category,
      tags,
      authors,
      thumbnailAltText: data.thumbnailAltText,
      createdBy: user,
      // Use properly parsed and structured data
      promotionalData: {
        title: parsedPromotionalData.title || '',
        keywords: Array.isArray(parsedPromotionalData.keywords)
          ? parsedPromotionalData.keywords
          : parsedPromotionalData.keywords
            ? [parsedPromotionalData.keywords]
            : [],
        promotional_url: parsedPromotionalData.promotional_url || '',
        image: parsedPromotionalData.image || '',
      },
      faqData: {
        faqTitle: parsedFaqData.faqTitle || '',
        items: Array.isArray(parsedFaqData.items)
          ? parsedFaqData.items.map((item: any, index: number) => ({
              id: item?.id || `faq_${Date.now()}_${index}`,
              question: item?.question || '',
              answer: item?.answer || '',
            }))
          : [],
      },
    });

    // ✅ Save blog
    const savedBlog = await this.blogRepo.save(blog);
    console.log('💾 Saved blog - Featured:', savedBlog.featured, 'Status:', savedBlog.status);
    console.log('💾 Saved promotionalData:', JSON.stringify(savedBlog.promotionalData, null, 2));
    console.log('💾 Saved faqData:', JSON.stringify(savedBlog.faqData, null, 2));

    return this.transformBlogResponse(savedBlog);
  }

  // ✅ GET ALL BLOGS WITH FILTERS AND PAGINATION
  // src/modules/blog/blog.service.ts
  async getAll(filters: BlogFilterDto): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 9, search, sortBy = 'createdAt', sortOrder = 'DESC' } = filters;
    const skip = (page - 1) * limit;

    console.log(`📊 Pagination: Page ${page}, Limit ${limit}, Skip ${skip}`);

    // ✅ NEW: Always get 2 featured blogs first
    let featuredBlogs: Blog[] = [];

    // Only fetch featured blogs if we're on the first page and not searching/filtering
    if (page === 1 && !search && !filters.category && !filters.author && !filters.tagSlugs && !filters.tagIds) {
      const featuredQueryBuilder = this.blogRepo
        .createQueryBuilder('blog')
        .leftJoinAndSelect('blog.category', 'category')
        .leftJoinAndSelect('blog.page', 'page')
        .leftJoinAndSelect('blog.authors', 'authors')
        .leftJoinAndSelect('blog.tags', 'tags')
        .leftJoinAndSelect('blog.createdBy', 'createdBy')
        .where('blog.featured = :featured', { featured: true })
        .andWhere('blog.status = :status', { status: true })
        .orderBy('blog.createdAt', 'DESC')
        .take(2);

      featuredBlogs = await featuredQueryBuilder.getMany();
      console.log(`🌟 Found ${featuredBlogs.length} featured blogs`);
    }

    const queryBuilder = this.blogRepo
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.category', 'category')
      .leftJoinAndSelect('blog.page', 'page')
      .leftJoinAndSelect('blog.authors', 'authors')
      .leftJoinAndSelect('blog.tags', 'tags')
      .leftJoinAndSelect('blog.createdBy', 'createdBy');

    // ✅ Apply filters
    this.applyFilters(queryBuilder, filters, search);

    // ✅ Get total count
    const total = await queryBuilder.getCount();
    console.log(`📈 Total blogs found: ${total}`);

    // ✅ Apply pagination and ordering
    let data = await queryBuilder
      .orderBy(`blog.${this.validateSortField(sortBy)}`, sortOrder)
      .skip(skip)
      .take(limit)
      .getMany();

    // ✅ NEW: Combine featured blogs with regular blogs for first page
    if (page === 1 && featuredBlogs.length > 0) {
      // Remove any duplicates (in case featured blogs are also in the regular query)
      const featuredIds = featuredBlogs.map((blog) => blog.id);
      const regularBlogs = data.filter((blog) => !featuredIds.includes(blog.id));

      // Combine: featured first, then regular blogs
      data = [...featuredBlogs, ...regularBlogs].slice(0, limit);

      console.log(`🔄 Combined ${featuredBlogs.length} featured + ${regularBlogs.length} regular blogs`);
    }

    console.log(`✅ Retrieved ${data.length} blogs for page ${page}`);

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
  // async getAll(filters: BlogFilterDto): Promise<PaginatedResponse<any>> {
  //   const { page = 1, limit = 9, search, sortBy = 'createdAt', sortOrder = 'DESC' } = filters;
  //   const skip = (page - 1) * limit;

  //   console.log(`📊 Pagination: Page ${page}, Limit ${limit}, Skip ${skip}`);

  //   const queryBuilder = this.blogRepo
  //     .createQueryBuilder('blog')
  //     .leftJoinAndSelect('blog.category', 'category')
  //     .leftJoinAndSelect('blog.page', 'page')
  //     .leftJoinAndSelect('blog.authors', 'authors')
  //     .leftJoinAndSelect('blog.tags', 'tags')
  //     .leftJoinAndSelect('blog.createdBy', 'createdBy');

  //   // ✅ Apply filters
  //   this.applyFilters(queryBuilder, filters, search);

  //   // ✅ Get total count
  //   const total = await queryBuilder.getCount();
  //   console.log(`📈 Total blogs found: ${total}`);

  //   // ✅ Apply pagination and ordering
  //   const data = await queryBuilder
  //     .orderBy(`blog.${this.validateSortField(sortBy)}`, sortOrder)
  //     .skip(skip)
  //     .take(limit)
  //     .getMany();

  //   console.log(`✅ Retrieved ${data.length} blogs for page ${page}`);

  //   const totalPages = Math.ceil(total / limit);

  //   return {
  //     data: data.map((blog) => this.transformBlogResponse(blog)),
  //     meta: {
  //       total,
  //       page,
  //       limit,
  //       totalPages,
  //       hasNext: page < totalPages,
  //       hasPrev: page > 1,
  //     },
  //   };
  // }

  private applyFilters(queryBuilder: any, filters: BlogFilterDto, search?: string) {
    // ✅ Status filter - default to active blogs if not specified
    if (filters.status !== undefined) {
      queryBuilder.andWhere('blog.status = :status', { status: filters.status });
    } else {
      queryBuilder.andWhere('blog.status = :status', { status: true });
    }

    // ✅ Search across multiple fields
    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('blog.title ILIKE :search', { search: `%${search}%` })
            .orWhere('blog.subtitle ILIKE :search', { search: `%${search}%` })
            .orWhere('blog.content ILIKE :search', { search: `%${search}%` })
            .orWhere('category.name ILIKE :search', { search: `%${search}%` })
            .orWhere('tags.name ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    // ✅ Category filter by slug
    if (filters.category) {
      queryBuilder.andWhere('category.slug = :categorySlug', { categorySlug: filters.category });
    }

    // ✅ Author filter
    if (filters.author) {
      queryBuilder.andWhere('authors.id = :authorId', { authorId: filters.author });
    }

    // ✅ Blog type filter
    if (filters.blogType) {
      queryBuilder.andWhere('blog.blogType = :blogType', { blogType: filters.blogType });
    }

    // ✅ Featured filter
    if (filters.featured !== undefined) {
      queryBuilder.andWhere('blog.featured = :featured', { featured: filters.featured });
    }

    // ✅ Tags filter by slugs
    if (filters.tagSlugs) {
      const tagSlugs = filters.tagSlugs.split(',').map((slug) => slug.trim());
      queryBuilder.andWhere('tags.slug IN (:...tagSlugs)', { tagSlugs });
    }

    // ✅ Tags filter by IDs
    if (filters.tagIds) {
      const tagIds = filters.tagIds.split(',').map((id) => parseInt(id.trim()));
      queryBuilder.andWhere('tags.id IN (:...tagIds)', { tagIds });
    }
  }

  private validateSortField(sortBy: string): string {
    const allowedSortFields = ['createdAt', 'updatedAt', 'title', 'readingTime', 'wordCount', 'featured'];
    return allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  }

  private async getBlogPageEntity() {
    let page = await this.pageRepo.findOne({
      where: [{ url: '/blog' }, { slug: 'blog' }],
    });

    if (!page) {
      // Return virtual page
      return {
        id: 0,
        name: 'Blog',
        title: 'Blog - Optionia',
        description: 'Read our latest blog posts and articles',
        slug: 'blog',
        url: '/blog',
        metaTitle: 'Blog - Optionia',
        metaDescription: 'Read our latest blog posts and articles',
        isActive: true,
      };
    }

    return page;
  }

  // async getAll(filters: BlogFilterDto): Promise<PaginatedResponse<any>> {
  //   const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = filters;
  //   const skip = (page - 1) * limit;

  //   console.log('🔍 Filters received:', filters);

  //   // Create query builder for flexible filtering
  //   const queryBuilder = this.blogRepo
  //     .createQueryBuilder('blog')
  //     .leftJoinAndSelect('blog.category', 'category')
  //     .leftJoinAndSelect('blog.page', 'page')
  //     .leftJoinAndSelect('blog.authors', 'authors')
  //     .leftJoinAndSelect('blog.tags', 'tags')
  //     .leftJoinAndSelect('blog.createdBy', 'createdBy');

  //   // ✅ CHANGED: Only filter by status if explicitly provided
  //   if (filters.status !== undefined) {
  //     console.log('🎯 Filtering by status:', filters.status);
  //     queryBuilder.andWhere('blog.status = :status', { status: filters.status });
  //   }
  //   // ✅ If status not provided, show ALL blogs (no status filter)

  //   // Add search condition across title, subtitle, and content
  //   if (search) {
  //     queryBuilder.andWhere('(blog.title ILIKE :search OR blog.subtitle ILIKE :search OR blog.content ILIKE :search)', {
  //       search: `%${search}%`,
  //     });
  //   }

  //   // ✅ FIXED: Add category filter by slug
  //   if (filters.category) {
  //     queryBuilder.andWhere('category.slug = :categorySlug', { categorySlug: filters.category });
  //   }

  //   // Add author filter (many-to-many relationship)
  //   if (filters.author) {
  //     queryBuilder.andWhere('authors.id = :authorId', { authorId: filters.author });
  //   }

  //   // Add blogType filter
  //   if (filters.blogType) {
  //     queryBuilder.andWhere('blog.blogType = :blogType', { blogType: filters.blogType });
  //   }

  //   // ✅ FIXED: Featured filter - handle boolean properly
  //   if (filters.featured !== undefined) {
  //     console.log('🎯 Filtering by featured:', filters.featured);
  //     queryBuilder.andWhere('blog.featured = :featured', { featured: filters.featured });
  //   }

  //   // ✅ FIXED: Add tags filter by slug instead of ID
  //   if (filters.tagSlugs) {
  //     const tagSlugs = filters.tagSlugs.split(',').map((slug) => slug.trim());
  //     queryBuilder.andWhere('tags.slug IN (:...tagSlugs)', { tagSlugs });
  //   }

  //   // ✅ FIXED: Add tags filter by ID (like category)
  //   if (filters.tagIds) {
  //     const tagIds = filters.tagIds.split(',').map((id) => parseInt(id.trim()));
  //     queryBuilder.andWhere('tags.id IN (:...tagIds)', { tagIds });
  //   }

  //   // Get total count
  //   const total = await queryBuilder.getCount();

  //   // Apply pagination and ordering
  //   const data = await queryBuilder.orderBy(`blog.${sortBy}`, sortOrder).skip(skip).take(limit).getMany();

  //   console.log('📊 Blogs found:', data.length);
  //   console.log(
  //     '🎯 Featured values in results:',
  //     data.map((blog) => ({ id: blog.id, featured: blog.featured, status: blog.status })),
  //   );

  //   const totalPages = Math.ceil(total / limit);

  //   return {
  //     data: data.map((blog) => this.transformBlogResponse(blog)),
  //     meta: {
  //       total,
  //       page,
  //       limit,
  //       totalPages,
  //       hasNext: page < totalPages,
  //       hasPrev: page > 1,
  //     },
  //   };
  // }

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
    console.log(
      '📁 Files received:',
      files?.map((f) => ({ fieldname: f.fieldname, originalname: f.originalname })),
    );
    console.log('📝 Current blog - Featured:', blog.featured, 'Status:', blog.status);

    // ✅ Handle promotionalData JSON for update - IMPROVED PARSING
    let parsedPromotionalData: any = blog.promotionalData || {
      title: '',
      keywords: [],
      promotional_url: '',
      image: '',
    };
    if (data.promotionalData) {
      if (typeof data.promotionalData === 'string') {
        try {
          const newData = JSON.parse(data.promotionalData);
          parsedPromotionalData = {
            ...parsedPromotionalData,
            ...(newData && typeof newData === 'object' ? (newData as Record<string, any>) : {}),
          };
          console.log('✅ Parsed promotionalData from string:', parsedPromotionalData);
        } catch (error) {
          console.warn('Failed to parse promotionalData:', error);
          // If parsing fails but it's an object, use it directly
          if (typeof data.promotionalData === 'object') {
            parsedPromotionalData = {
              ...parsedPromotionalData,
              ...(data.promotionalData as Record<string, any>),
            };
          }
        }
      } else if (typeof data.promotionalData === 'object') {
        parsedPromotionalData = {
          ...parsedPromotionalData,
          ...(data.promotionalData as Record<string, any>),
        };
      }
    }

    // ✅ Handle faqData JSON for update - IMPROVED PARSING
    let parsedFaqData: any = blog.faqData || { faqTitle: '', items: [] };
    if (data.faqData) {
      if (typeof data.faqData === 'string') {
        try {
          const newData = JSON.parse(data.faqData);
          if (newData && typeof newData === 'object') {
            parsedFaqData = { ...parsedFaqData, ...(newData as Record<string, any>) };
          } else {
            console.warn('Parsed faqData is not an object:', newData);
          }
          console.log('✅ Parsed faqData from string:', parsedFaqData);
        } catch (error) {
          console.warn('Failed to parse faqData:', error);
          if (data.faqData && typeof data.faqData === 'object') {
            parsedFaqData = { ...parsedFaqData, ...(data.faqData as Record<string, any>) };
          }
        }
      } else if (data.faqData && typeof data.faqData === 'object') {
        parsedFaqData = { ...parsedFaqData, ...(data.faqData as Record<string, any>) };
      }
    }

    // ✅ Handle uploaded files for update
    if (files?.length) {
      const allowedFields = ['thumbnail', 'image', 'promotional_image'];
      const fileData: any = {};

      this.uploadsService.mapFilesToData(files, fileData, allowedFields);

      console.log('📁 Processed files:', fileData);

      // Convert field names to match your entity
      if (fileData['thumbnail']) {
        data.thumbnailUrl = fileData['thumbnail'];
        console.log('✅ Thumbnail set to:', data.thumbnailUrl);
      }

      // Handle multiple images
      if (fileData['image']) {
        data.image = Array.isArray(fileData['image']) ? fileData['image'] : [fileData['image']];
        console.log('✅ Images set to:', data.image);
      }

      // Handle promotional image - store the file path directly
      if (fileData['promotional_image']) {
        console.log('✅ Promotional image found:', fileData['promotional_image']);
        parsedPromotionalData.image = fileData['promotional_image'];
      }
    }

    // ✅ Handle boolean fields properly
    if (data.featured !== undefined) {
      blog.featured = data.featured === true || ['true', '1'].includes(String(data.featured));
      console.log('✅ Updated featured to:', blog.featured);
    }

    if (data.status !== undefined) {
      blog.status = data.status === true || ['true', '1', 'published'].includes(String(data.status));
      console.log('✅ Updated status to:', blog.status);
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

    // ✅ Update promotionalData with proper structure
    blog.promotionalData = {
      title: parsedPromotionalData.title || '',
      keywords: Array.isArray(parsedPromotionalData.keywords)
        ? parsedPromotionalData.keywords
        : parsedPromotionalData.keywords
          ? [parsedPromotionalData.keywords]
          : [],
      promotional_url: parsedPromotionalData.promotional_url || '',
      image: parsedPromotionalData.image || '',
    };

    // ✅ Update faqData with proper structure
    blog.faqData = {
      faqTitle: parsedFaqData.faqTitle || '',
      items: Array.isArray(parsedFaqData.items)
        ? parsedFaqData.items.map((it: any, index: number) => ({
            id: it?.id || `faq_${Date.now()}_${index}`,
            question: it?.question || '',
            answer: it?.answer || '',
          }))
        : [],
    };

    // ✅ Update other fields including new ones
    if (data.thumbnailAltText !== undefined) blog.thumbnailAltText = data.thumbnailAltText;
    if (data.keyTakeaways !== undefined) blog.keyTakeaways = data.keyTakeaways;
    if (data.readingTime !== undefined) blog.readingTime = data.readingTime;
    if (data.wordCount !== undefined) blog.wordCount = data.wordCount;
    if (data.blogType !== undefined) blog.blogType = data.blogType;
    if (data.metaData !== undefined) blog.metaData = data.metaData;
    if (data.subtitle !== undefined) blog.subtitle = data.subtitle;
    if (data.content !== undefined) blog.content = data.content;

    // ✅ Update createdBy if user provided
    if (user) {
      blog.createdBy = user;
    }

    // ✅ Save updated blog
    const updatedBlog = await this.blogRepo.save(blog);
    console.log('💾 After update - Featured:', updatedBlog.featured, 'Status:', updatedBlog.status);
    console.log('💾 Updated promotionalData:', JSON.stringify(updatedBlog.promotionalData, null, 2));
    console.log('💾 Updated faqData:', JSON.stringify(updatedBlog.faqData, null, 2));

    return this.transformBlogResponse(updatedBlog);
  }

  // ✅ UPDATE BLOG
  // async update(
  //   id: number,
  //   data: UpdateBlogDto,
  //   files?: Express.Multer.File[],
  //   imageIndexMap?: Record<string, number>,
  //   user?: User,
  // ) {
  //   const blog = await this.blogRepo.findOne({
  //     where: { id },
  //     relations: ['authors', 'tags', 'category', 'page', 'createdBy'],
  //   });
  //   if (!blog) throw new NotFoundException('Blog not found');

  //   console.log('🔄 Update data received:', data);
  //   console.log('📝 Current blog - Featured:', blog.featured, 'Status:', blog.status);

  //   // ✅ Handle uploaded files for update
  //   const uploadedFiles: any = {};
  //   // ✅ Handle uploaded files using the existing UploadsService
  //   if (files?.length) {
  //     const allowedFields = ['thumbnail', 'image', 'promotional_image'];
  //     const fileData: any = {};

  //     this.uploadsService.mapFilesToData(files, fileData, allowedFields);

  //     // Convert field names to match your entity
  //     if (fileData['thumbnail']) {
  //       data.thumbnailUrl = fileData['thumbnail'];
  //     }

  //     // Handle multiple images
  //     if (fileData['image']) {
  //       data.image = Array.isArray(fileData['image']) ? fileData['image'] : [fileData['image']];
  //     }

  //     // Handle promotional image - store the file path directly
  //     if (fileData['promotional_image']) {
  //       // If promotionalData doesn't exist, create it
  //       if (!data.promotionalData) {
  //         data.promotionalData = {
  //           title: '',
  //           keywords: [],
  //           promotional_url: '',
  //           image: fileData['promotional_image'],
  //         };
  //       } else {
  //         // If promotionalData exists, just add the image
  //         data.promotionalData.image = fileData['promotional_image'];
  //       }
  //     }
  //   }

  //   // ✅ Handle promotional_content from form data for update
  //   if ((data as any).promotional_content) {
  //     try {
  //       const promotionalContent = JSON.parse((data as any).promotional_content);
  //       data.promotionalData = {
  //         ...blog.promotionalData,
  //         ...data.promotionalData,
  //         ...promotionalContent,
  //         // Preserve existing image if new one not uploaded
  //         ...(uploadedFiles.promotional_image ? { image: uploadedFiles.promotional_image } : {}),
  //       };
  //     } catch (error) {
  //       console.warn('Failed to parse promotional_content:', error);
  //     }
  //   }

  //   // ✅ Handle faqData from form data for update
  //   if ((data as any).faqData) {
  //     try {
  //       const faqData = JSON.parse((data as any).faqData);
  //       data.faqData = faqData;
  //     } catch (error) {
  //       console.warn('Failed to parse faqData:', error);
  //     }
  //   }

  //   // ✅ Handle boolean fields properly
  //   if (data.featured !== undefined) {
  //     blog.featured = data.featured;
  //     console.log('✅ Updated featured to:', data.featured);
  //   }

  //   if (data.status !== undefined) {
  //     blog.status = data.status;
  //     console.log('✅ Updated status to:', data.status);
  //   }

  //   // ✅ Handle page update
  //   if (data.pageId) {
  //     const page = await this.pageRepo.findOne({ where: { id: data.pageId } });
  //     if (!page) throw new NotFoundException('Page not found');
  //     blog.page = page;
  //   }

  //   // ✅ Handle category update
  //   if (data.categoryId) {
  //     const category = await this.categoryRepo.findOne({ where: { id: data.categoryId } });
  //     if (!category) throw new NotFoundException('Category not found');
  //     blog.category = category;
  //   }

  //   // ✅ Handle authors update
  //   if (data.authorIds?.length) {
  //     const authors = await this.userRepo.find({ where: { id: In(data.authorIds) } });
  //     if (authors.length !== data.authorIds.length) {
  //       throw new BadRequestException('Some authorIds are invalid');
  //     }
  //     blog.authors = authors;
  //   }

  //   // ✅ Handle tags update
  //   if (data.tagIds?.length) {
  //     const tags = await this.tagRepo.find({ where: { id: In(data.tagIds) } });
  //     if (tags.length !== data.tagIds.length) {
  //       throw new BadRequestException('Some tagIds are invalid');
  //     }
  //     blog.tags = tags;
  //   }

  //   // ✅ Handle file uploads with imageIndexMap for specific image replacement
  //   if (files?.length) {
  //     // Prepare the existing data structure for mapFilesToData
  //     const existingData = {
  //       thumbnailUrl: blog.thumbnailUrl,
  //       image: blog.image || [],
  //     };

  //     // Use the UploadsService to handle file mapping with index replacement
  //     this.uploadsService.mapFilesToData(files, data as any, ['thumbnailUrl', 'image'], existingData, {
  //       arrayIndex: imageIndexMap,
  //     });

  //     // Apply the file changes to the blog entity
  //     if (data.thumbnailUrl !== undefined) {
  //       blog.thumbnailUrl = data.thumbnailUrl;
  //     }

  //     if (data.image !== undefined) {
  //       blog.image = data.image;
  //     }
  //   }

  //   // ✅ Handle slug update if title changed
  //   if (data.title && data.title !== blog.title) {
  //     blog.slug = data.slug || slugify(data.title);
  //   }

  //   // ✅ Update other fields including new ones
  //   if (data.keyTakeaways !== undefined) blog.keyTakeaways = data.keyTakeaways;
  //   if (data.promotionalData !== undefined) {
  //     // Ensure promotionalData has all required fields and correct types before assignment
  //     blog.promotionalData = {
  //       title: data.promotionalData.title ?? '',
  //       keywords: Array.isArray(data.promotionalData.keywords)
  //         ? data.promotionalData.keywords
  //         : data.promotionalData.keywords
  //           ? [data.promotionalData.keywords]
  //           : [],
  //       promotional_url: data.promotionalData.promotional_url ?? '',
  //       ...(data.promotionalData.image ? { image: data.promotionalData.image } : {}),
  //     };
  //   }
  //   if (data.faqData !== undefined) {
  //     // Normalize FAQ data to satisfy required fields and types
  //     const rawFaq: any = data.faqData || {};
  //     const items = Array.isArray(rawFaq.items)
  //       ? rawFaq.items.map((it: any) => ({
  //           id: it?.id !== undefined ? String(it.id) : `${Date.now()}_${Math.random().toString().slice(2)}`,
  //           question: it?.question ?? '',
  //           answer: it?.answer ?? '',
  //         }))
  //       : [];

  //     blog.faqData = {
  //       faqTitle: rawFaq.faqTitle ?? '',
  //       items,
  //     };
  //   }
  //   if (data.readingTime !== undefined) blog.readingTime = data.readingTime;
  //   if (data.wordCount !== undefined) blog.wordCount = data.wordCount;
  //   if (data.blogType !== undefined) blog.blogType = data.blogType;
  //   if (data.metaData !== undefined) blog.metaData = data.metaData;
  //   if (data.subtitle !== undefined) blog.subtitle = data.subtitle;
  //   if (data.content !== undefined) blog.content = data.content;

  //   // ✅ Update createdBy if user provided
  //   if (user) {
  //     blog.createdBy = user;
  //   }

  //   // ✅ Save updated blog
  //   const updatedBlog = await this.blogRepo.save(blog);
  //   console.log('💾 After update - Featured:', updatedBlog.featured, 'Status:', updatedBlog.status);
  //   console.log('💾 Updated promotionalData:', updatedBlog.promotionalData);
  //   console.log('💾 Updated faqData:', updatedBlog.faqData);

  //   return this.transformBlogResponse(updatedBlog);
  // }

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

    // Delete promotional image if exists
    if (blog.promotionalData?.image) {
      const fullPath = '.' + blog.promotionalData.image;
      try {
        if (require('fs').existsSync(fullPath)) {
          require('fs').unlinkSync(fullPath);
        }
      } catch (error) {
        console.warn('Could not delete promotional image file:', error);
      }
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
          page,
          blogs: blogsResponse.data,
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

    return {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      subtitle: blog.subtitle,
      content: blog.content,
      keyTakeaways: blog.keyTakeaways,
      thumbnailUrl: blog.thumbnailUrl,
      thumbnailAltText: blog.thumbnailAltText,
      image: blog.image,
      metaData: blog.metaData,
      promotionalData: blog.promotionalData,
      faqData: blog.faqData,
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
      tags: blog.tags?.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
      })),
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
    };
  }
  // private transformBlogResponse(blog: Blog) {
  //   const metaTitle = blog.metaData?.metaTitle || blog.title;
  //   const metaDescription =
  //     blog.metaData?.metaDescription ||
  //     blog.subtitle ||
  //     (blog.content ? blog.content.replace(/<[^>]+>/g, '').substring(0, 160) : '') ||
  //     'Explore this blog on Optionia.';

  //   const pageUrl = `https://optionia.com/${blog.page?.slug || 'blog'}/${blog.slug}`;

  //   const openGraph = {
  //     title: metaTitle,
  //     description: metaDescription,
  //     url: pageUrl,
  //     type: 'article',
  //     image: blog.thumbnailUrl || blog.image?.[0],
  //   };

  //   const twitter = {
  //     card: 'summary_large_image',
  //     title: metaTitle,
  //     description: metaDescription,
  //     image: blog.thumbnailUrl || blog.image?.[0],
  //   };

  //   return {
  //     id: blog.id,
  //     title: blog.title,
  //     slug: blog.slug,
  //     subtitle: blog.subtitle,
  //     content: blog.content,
  //     keyTakeaways: blog.keyTakeaways, // ✅ New field
  //     thumbnailUrl: blog.thumbnailUrl,
  //     image: blog.image,
  //     metaData: blog.metaData,
  //     // ✅ New fields included in response
  //     promotionalData: blog.promotionalData,
  //     faqData: blog.faqData,
  //     readingTime: blog.readingTime,
  //     wordCount: blog.wordCount,
  //     featured: blog.featured,
  //     blogType: blog.blogType,
  //     status: blog.status,
  //     page: blog.page
  //       ? {
  //           id: blog.page.id,
  //           name: blog.page.name,
  //           slug: blog.page.slug,
  //         }
  //       : null,
  //     category: blog.category
  //       ? {
  //           id: blog.category.id,
  //           name: blog.category.name,
  //           slug: blog.category.slug,
  //         }
  //       : null,
  //     tags: blog.tags?.map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
  //     authors: blog.authors?.map((a) => ({
  //       id: a.id,
  //       username: a.username,
  //       email: a.email,
  //       profileImage: a.profileImage,
  //     })),
  //     createdBy: blog.createdBy
  //       ? {
  //           id: blog.createdBy.id,
  //           username: blog.createdBy.username,
  //           email: blog.createdBy.email,
  //           profileImage: blog.createdBy.profileImage,
  //         }
  //       : null,
  //     createdAt: blog.createdAt,
  //     updatedAt: blog.updatedAt,
  //     openGraph,
  //     twitter,
  //   };
  // }

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

      // Delete promotional images
      if (blog.promotionalData?.image) {
        const fullPath = '.' + blog.promotionalData.image;
        try {
          if (require('fs').existsSync(fullPath)) {
            require('fs').unlinkSync(fullPath);
          }
        } catch (error) {
          console.warn('Could not delete promotional image file:', error);
        }
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
