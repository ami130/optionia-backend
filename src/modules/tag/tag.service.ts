import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { Like, Repository } from 'typeorm';
import { tagDto } from './dto/tag.dto';
import { commonQueryDto } from '../blog/dto/blog-query.dto';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async createTag(createTag: tagDto): Promise<Tag> {
    if (!createTag || !createTag?.name) {
      throw new BadRequestException('Invalid : Tag Title is Required');
    }

    const existTag = await this.tagRepository.findOne({ where: { name: createTag?.name } });

    if (existTag) {
      throw new ConflictException('Tag name already exists');
    }

    const result = this.tagRepository.create(createTag);
    return this.tagRepository.save(result);
  }

  async getAllTag(query: commonQueryDto): Promise<{ data: Tag[]; count: number }> {
    const { page = 1, limit = 10, search = '', order = 'DESC', sortBy = 'createdAt' } = query;
    const skip = (page - 1) * limit;

    // Build query
    const [data, count] = await this.tagRepository.findAndCount({
      where: [{ name: Like(`%${search}%`) }],
      order: {
        [sortBy]: order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
      },
      take: limit,
      skip,
    });

    return { data, count };
  }

  async deleteTag(id: number) {
    const result = await this.tagRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    return { deleted: true, id };
  }

  async updateTag(id: number, updatedTag: tagDto): Promise<Tag> {
    const existingTag = await this.tagRepository.findOne({
      where: { id: id },
    });

    if (!existingTag) {
      throw new NotFoundException('Tag not Found');
    }

    if (updatedTag.name && updatedTag.name !== existingTag?.name) {
      const nameExists = await this.tagRepository.findOne({
        where: { name: updatedTag?.name },
      });
      if (nameExists) {
        throw new ConflictException('Tag name already exists');
      }
    }

    const updatedTagData = Object.assign(existingTag, updatedTag);
    updatedTagData.updatedAt = new Date(); // Update the timestamp

    return await this.tagRepository.save(updatedTagData);
  }
}
