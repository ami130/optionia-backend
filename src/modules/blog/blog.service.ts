// src/modules/blog/blog.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private blogRepo: Repository<Blog>,
  ) {}

  async create(data: CreateBlogDto, user: User) {
    const blog = this.blogRepo.create({ ...data, author: user });
    return this.blogRepo.save(blog);
  }

  async update(id: number, data: UpdateBlogDto) {
    const blog = await this.blogRepo.findOne({ where: { id } });
    if (!blog) throw new NotFoundException('Blog not found');
    Object.assign(blog, data);
    return this.blogRepo.save(blog);
  }

  async delete(id: number) {
    const blog = await this.blogRepo.findOne({ where: { id } });
    if (!blog) throw new NotFoundException('Blog not found');
    return this.blogRepo.remove(blog);
  }

  async getAll() {
    return this.blogRepo.find();
  }

  async getById(id: number) {
    const blog = await this.blogRepo.findOne({ where: { id } });
    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }
}






// import { CreateBlogDto } from './dto/create-blog.dto';
// import {
//   BadRequestException,
//   ConflictException,
//   Injectable,
//   InternalServerErrorException,
//   NotFoundException,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Blog } from './entities/blog.entity';
// import { Not, Repository } from 'typeorm';
// import { User } from 'src/users/entities/user.entity';
// import { UpdateBlogDto } from './dto/update-blog.dto';
// import { commonQueryDto } from './dto/blog-query.dto';

// @Injectable()
// export class BlogService {
//   constructor(
//     @InjectRepository(Blog)
//     private readonly blogRepository: Repository<Blog>,
//     @InjectRepository(User)
//     private readonly userRepository: Repository<User>,
//   ) {}

//   async createBlog(createBlogDto: CreateBlogDto, authorId: number): Promise<Blog> {
//     if (!createBlogDto || !createBlogDto.title) {
//       throw new BadRequestException('Invalid blog data: title is required');
//     }

//     const existsBlog = await this.blogRepository.findOne({ where: { title: createBlogDto.title } });

//     if (existsBlog) {
//       throw new ConflictException('Blog title already exists');
//     }

//     // Get the author user
//     const author = await this.userRepository.findOne({
//       where: { id: authorId },
//     });
//     if (!author) {
//       throw new NotFoundException('Author user not found');
//     }

//     const blog = this.blogRepository.create({
//       ...createBlogDto,
//       author,
//       image: createBlogDto.imageUrl,
//       status: createBlogDto.status || 'published',
//     });

//     return this.blogRepository.save(blog);
//   }

//   async getAllBlog(query: commonQueryDto): Promise<{ data: Blog[]; count: number }> {
//     const { page = 1, limit = 10, search, authorId, order = 'DESC', sortBy = 'createdAt' } = query;
//     const skip = (page - 1) * limit;

//     try {
//       const queryBuilder = this.blogRepository
//         .createQueryBuilder('blog')
//         .leftJoinAndSelect('blog.author', 'author')
//         .take(limit)
//         .skip(skip);

//       // Check if sortBy is a valid column
//       const validSortColumns = ['title', 'createdAt', 'updatedAt']; // Add your actual blog columns here

//       const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : 'createdAt';

//       queryBuilder.orderBy(`blog.${safeSortBy}`, order);

//       if (authorId) {
//         queryBuilder.andWhere('author.id = :authorId', { authorId });
//       }
//       if (search) {
//         queryBuilder.andWhere(
//           '(LOWER(blog.title) LIKE LOWER(:search) OR LOWER(blog.description) LIKE LOWER(:search))',
//           { search: `%${search}%` },
//         );
//       }

//       const [data, count] = await queryBuilder.getManyAndCount();

//       return { data, count };
//     } catch (error) {
//       console.error('Error in getAllBlog:', error); // ✅ Logs full error in terminal

//       throw new InternalServerErrorException('Failed to retrieve blogs'); // ✅ Proper error message
//     }
//   }

//   async deleteBlog(id: number) {
//     const result = await this.blogRepository.delete(id);
//     if (result.affected === 0) {
//       throw new NotFoundException(`Blog with ID ${id} not found`);
//     }
//     return { deleted: true, id };
//   }

//   async blogDetails(id: number) {
//     const result = await this.blogRepository.findOne({
//       where: { id: id },
//       relations: ['author'], // 👈 add this line to load author relation
//     });

//     if (!result) {
//       throw new NotFoundException(`Blog with ID ${id} not found`);
//     }

//     return result;
//   }

//   async getRelatedBlogs(currentBlogId: number, limit = 4): Promise<Blog[]> {
//     const blogs = await this.blogRepository.find({
//       where: {
//         id: Not(currentBlogId),
//       },
//       relations: ['author'],
//       take: limit,
//       order: { createdAt: 'DESC' },
//     });

//     return blogs;
//   }

//   // Update blog
//   async updateBlog(id: number, updateBlogDto: UpdateBlogDto, userId: number): Promise<Blog> {
//     const existingBlog = await this.blogRepository.findOne({
//       where: { id: id },
//       relations: ['author'],
//     });

//     if (!existingBlog) {
//       throw new NotFoundException('Blog not found');
//     }

//     if (existingBlog.author.id !== userId) {
//       throw new UnauthorizedException('You are not authorized to update this blog');
//     }

//     // Check if title is being updated and if it already exists
//     if (updateBlogDto.title && updateBlogDto.title !== existingBlog.title) {
//       const titleExists = await this.blogRepository.findOne({
//         where: { title: updateBlogDto.title },
//       });

//       if (titleExists) {
//         throw new ConflictException('Blog title already exists');
//       }
//     }

//     // Update blog fields
//     const updatedBlog = Object.assign(existingBlog, updateBlogDto);
//     updatedBlog.updatedAt = new Date(); // Update the timestamp

//     // Save the updated blog
//     return await this.blogRepository.save(updatedBlog);
//   }
// }
