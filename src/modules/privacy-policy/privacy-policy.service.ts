// src/modules/privacy-policy/privacy-policy.service.ts
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrivacyPolicy } from './entities/privacy-policy.entity';
import { CreatePrivacyDto } from './dto/create-privacy.dto';
import { UpdatePrivacyDto } from './dto/update-privacy.dto';
import { Page } from 'src/modules/pages/entities/page.entity';

@Injectable()
export class PrivacyPolicyService {
  constructor(
    @InjectRepository(PrivacyPolicy)
    private readonly privacyRepo: Repository<PrivacyPolicy>,
    @InjectRepository(Page)
    private readonly pageRepo: Repository<Page>,
  ) {}

  async create(dto: CreatePrivacyDto): Promise<PrivacyPolicy> {
    // Check if privacy policy already exists (only one allowed)
    const existingPrivacy = await this.privacyRepo.findOne({ where: {} });
    if (existingPrivacy) {
      throw new ConflictException('Privacy Policy already exists. Use update instead.');
    }

    // Check if slug exists
    const existingSlug = await this.privacyRepo.findOne({ where: { slug: dto.slug } });
    if (existingSlug) {
      throw new BadRequestException('Slug already exists');
    }

    // Find and validate page
    const page = await this.pageRepo.findOne({ where: { id: dto.pageId } });
    if (!page) {
      throw new NotFoundException('Page not found');
    }

    const privacy = this.privacyRepo.create({
      ...dto,
      page: page,
    });

    return this.privacyRepo.save(privacy);
  }

  async findOne(slug: string): Promise<PrivacyPolicy> {
    const privacy = await this.privacyRepo.findOne({ 
      where: { slug },
      relations: ['page'] 
    });
    if (!privacy) throw new NotFoundException('Privacy Policy not found');
    return privacy;
  }

  async getCurrent(): Promise<PrivacyPolicy> {
    const privacy = await this.privacyRepo.findOne({ 
      where: {},
      relations: ['page'] 
    });
    
    if (!privacy) {
      throw new NotFoundException('No Privacy Policy found');
    }
    
    return privacy;
  }

  async update(id: number, dto: UpdatePrivacyDto): Promise<PrivacyPolicy> {
    const privacy = await this.privacyRepo.findOne({ 
      where: { id },
      relations: ['page'] 
    });
    
    if (!privacy) throw new NotFoundException('Privacy Policy not found');

    // If pageId is provided, validate and update page
    if (dto.pageId) {
      const page = await this.pageRepo.findOne({ where: { id: dto.pageId } });
      if (!page) {
        throw new NotFoundException('Page not found');
      }
      privacy.page = page;
    }

    // Update other fields
    Object.assign(privacy, dto);
    
    return this.privacyRepo.save(privacy);
  }

  async updateCurrent(dto: UpdatePrivacyDto): Promise<PrivacyPolicy> {
    const privacy = await this.privacyRepo.findOne({ 
      where: {},
      relations: ['page'] 
    });
    
    if (!privacy) throw new NotFoundException('No Privacy Policy found');

    // If pageId is provided, validate and update page
    if (dto.pageId) {
      const page = await this.pageRepo.findOne({ where: { id: dto.pageId } });
      if (!page) {
        throw new NotFoundException('Page not found');
      }
      privacy.page = page;
    }

    // Update other fields
    Object.assign(privacy, dto);
    
    return this.privacyRepo.save(privacy);
  }

  async remove(id: number): Promise<void> {
    const privacy = await this.privacyRepo.findOne({ where: { id } });
    if (!privacy) throw new NotFoundException('Privacy Policy not found');
    await this.privacyRepo.remove(privacy);
  }

  async toggleStatus(id: number): Promise<PrivacyPolicy> {
    const privacy = await this.privacyRepo.findOne({ where: { id } });
    if (!privacy) throw new NotFoundException('Privacy Policy not found');
    
    privacy.isActive = !privacy.isActive;
    return this.privacyRepo.save(privacy);
  }
}