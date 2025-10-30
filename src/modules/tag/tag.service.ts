import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { Repository, Not } from 'typeorm';
import {  tagDto, UpdateTagDto } from './dto/tag.dto';
import { slugify } from 'src/common/config/slugify';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
  ) {}

  async create(dto: tagDto) {
    const name = dto.name.trim();
    const slug = dto.slug ? slugify(dto.slug) : slugify(name);

    const exists = await this.tagRepo.findOne({ where: [{ name }, { slug }] });
    if (exists) throw new ConflictException('Tag with same name or slug already exists');

    const tag = this.tagRepo.create({ name, slug });
    return this.tagRepo.save(tag);
  }

  async findAll() {
    return this.tagRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number) {
    const tag = await this.tagRepo.findOne({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');
    return tag;
  }

  async update(id: number, dto: UpdateTagDto) {
    const tag = await this.findOne(id);

    if (dto.name) tag.name = dto.name.trim();
    if (dto.slug) tag.slug = slugify(dto.slug);

    const duplicate = await this.tagRepo.findOne({
      where: [
        { id: Not(id), name: tag.name },
        { id: Not(id), slug: tag.slug },
      ],
    });

    if (duplicate) throw new ConflictException('Another tag with same name/slug exists');

    return this.tagRepo.save(tag);
  }

  async remove(id: number) {
    const tag = await this.findOne(id);
    return this.tagRepo.remove(tag);
  }
}
