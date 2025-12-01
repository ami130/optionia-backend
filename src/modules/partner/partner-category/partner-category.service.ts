// src/modules/partner-categories/partner-categories.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { PartnerCategory } from './entities/partner-category.entity';
import { CreatePartnerCategoryDto, UpdatePartnerCategoryDto } from './dto/create-partner-category.dto';
import { slugify } from 'src/common/config/slugify';

@Injectable()
export class PartnerCategoriesService {
  constructor(
    @InjectRepository(PartnerCategory)
    private readonly categoryRepo: Repository<PartnerCategory>,
  ) {}

  async create(dto: CreatePartnerCategoryDto) {
    const name = dto.name.trim();
    const slug = dto.slug ? slugify(dto.slug) : slugify(name);
    const status = dto.status !== undefined ? dto.status : true;

    const exists = await this.categoryRepo.findOne({ 
      where: [{ slug }, { name }] 
    });
    
    if (exists) {
      throw new ConflictException('Category with same name or slug already exists');
    }

    const category = this.categoryRepo.create({ name, slug, status });
    return this.categoryRepo.save(category);
  }

  async findAll(status?: boolean) {
    const where: any = {};
    
    if (status !== undefined) {
      where.status = status;
    }

    return this.categoryRepo.find({ 
      where,
      order: { name: 'ASC' }
    });
  }

  async findOne(id: number) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    
    return category;
  }

  async update(id: number, dto: UpdatePartnerCategoryDto) {
    const category = await this.findOne(id);

    if (dto.name) category.name = dto.name.trim();
    if (dto.slug) category.slug = slugify(dto.slug);
    if (dto.status !== undefined) category.status = dto.status;

    const exists = await this.categoryRepo.findOne({
      where: [
        { id: Not(id), slug: category.slug },
        { id: Not(id), name: category.name },
      ],
    });

    if (exists) {
      throw new ConflictException('Another category with same name/slug exists');
    }

    return this.categoryRepo.save(category);
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    return this.categoryRepo.remove(category);
  }

  async toggleStatus(id: number) {
    const category = await this.findOne(id);
    category.status = !category.status;
    return this.categoryRepo.save(category);
  }
}