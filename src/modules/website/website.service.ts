// src/modules/website/website.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageEntity } from './entities/page.entity';
import { CreatePageDto, UpdatePageDto } from './dto/page.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class WebsiteService {
  constructor(
    @InjectRepository(PageEntity)
    private readonly pageRepo: Repository<PageEntity>,
  ) {}

  async create(data: CreatePageDto): Promise<PageEntity> {
    const page = plainToInstance(PageEntity, data);
    return this.pageRepo.save(page);
  }

  async findAll(): Promise<PageEntity[]> {
    return this.pageRepo.find();
  }
  
  async findByKey(key: string): Promise<PageEntity> {
    const page = await this.pageRepo.findOne({ where: { key } });
    if (!page) throw new NotFoundException(`Page with key "${key}" not found`);
    return page;
  }

  async update(key: string, data: UpdatePageDto): Promise<PageEntity> {
    const page = await this.pageRepo.findOne({ where: { key } });
    if (!page) throw new NotFoundException(`Page with key "${key}" not found`);

    const updated = this.pageRepo.merge(page, data, {
      version: page.version + 1,
      updatedAt: new Date(),
    });

    return this.pageRepo.save(updated);
  }

  async remove(key: string): Promise<void> {
    const result = await this.pageRepo.delete({ key });
    if (result.affected === 0) {
      throw new NotFoundException(`Page with key "${key}" not found`);
    }
  }
}
