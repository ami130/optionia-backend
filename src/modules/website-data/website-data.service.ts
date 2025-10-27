// src/modules/website-data/website-data.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebsiteData } from './entities/website-data.entity';
import { CreateWebsiteDataDto } from './dto/website-data.dto';

@Injectable()
export class WebsiteDataService {
  constructor(
    @InjectRepository(WebsiteData)
    private readonly websiteDataRepository: Repository<WebsiteData>,
  ) {}

  async create(data: CreateWebsiteDataDto) {
    try {
      const existing = await this.websiteDataRepository.findOne({ where: {} });
      if (existing) {
        throw new BadRequestException('Website data already exists. Use update instead.');
      }

      const record = this.websiteDataRepository.create(data);
      return this.websiteDataRepository.save(record);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async get() {
    return this.websiteDataRepository.find();
  }

  async getById(id: number) {
    const record = await this.websiteDataRepository.findOne({ where: { id } });
    if (!record) throw new NotFoundException('Website data not found.');
    return record;
  }

  async update(id: number, data: Partial<CreateWebsiteDataDto>) {
    const record = await this.websiteDataRepository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException('Website data not found.');
    }

    Object.assign(record, data);
    return this.websiteDataRepository.save(record);
  }

  async delete(id: number) {
    const record = await this.websiteDataRepository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException('Website data not found.');
    }
    await this.websiteDataRepository.delete(id);
    return { message: 'Website data deleted successfully' };
  }
}
