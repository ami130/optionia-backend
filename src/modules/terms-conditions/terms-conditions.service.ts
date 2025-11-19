import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TermsConditions } from './entities/terms-conditions.entity';
import { CreateTermsDto } from './dto/create-terms.dto';
import { UpdateTermsDto } from './dto/update-terms.dto';
import { Page } from 'src/modules/pages/entities/page.entity';

@Injectable()
export class TermsConditionsService {
  constructor(
    @InjectRepository(TermsConditions)
    private readonly termsRepo: Repository<TermsConditions>,
    @InjectRepository(Page)
    private readonly pageRepo: Repository<Page>,
  ) {}

  async create(dto: CreateTermsDto): Promise<TermsConditions> {
    // Check if terms already exist (only one allowed)
    const existingTerms = await this.termsRepo.findOne({ where: {} });
    if (existingTerms) {
      throw new ConflictException('Terms of Service already exists. Use update instead.');
    }

    // Check if slug exists
    const existingSlug = await this.termsRepo.findOne({ where: { slug: dto.slug } });
    if (existingSlug) {
      throw new BadRequestException('Slug already exists');
    }

    // Find and validate page
    const page = await this.pageRepo.findOne({ where: { id: dto.pageId } });
    if (!page) {
      throw new NotFoundException('Page not found');
    }

    const term = this.termsRepo.create({
      ...dto,
      page: page,
    });

    return this.termsRepo.save(term);
  }

  async findOne(slug: string): Promise<TermsConditions> {
    const term = await this.termsRepo.findOne({ 
      where: { slug },
      relations: ['page'] 
    });
    if (!term) throw new NotFoundException('Terms not found');
    return term;
  }

  async getCurrent(): Promise<TermsConditions> {
    const term = await this.termsRepo.findOne({ 
      where: {},
      relations: ['page'] 
    });
    
    if (!term) {
      throw new NotFoundException('No Terms of Service found');
    }
    
    return term;
  }

  async update(id: number, dto: UpdateTermsDto): Promise<TermsConditions> {
    const term = await this.termsRepo.findOne({ 
      where: { id },
      relations: ['page'] 
    });
    
    if (!term) throw new NotFoundException('Terms not found');

    // If pageId is provided, validate and update page
    if (dto.pageId) {
      const page = await this.pageRepo.findOne({ where: { id: dto.pageId } });
      if (!page) {
        throw new NotFoundException('Page not found');
      }
      term.page = page;
    }

    // Update other fields
    Object.assign(term, dto);
    
    return this.termsRepo.save(term);
  }

  async updateCurrent(dto: UpdateTermsDto): Promise<TermsConditions> {
    const term = await this.termsRepo.findOne({ 
      where: {},
      relations: ['page'] 
    });
    
    if (!term) throw new NotFoundException('No Terms of Service found');

    // If pageId is provided, validate and update page
    if (dto.pageId) {
      const page = await this.pageRepo.findOne({ where: { id: dto.pageId } });
      if (!page) {
        throw new NotFoundException('Page not found');
      }
      term.page = page;
    }

    // Update other fields
    Object.assign(term, dto);
    
    return this.termsRepo.save(term);
  }

  async remove(id: number): Promise<void> {
    const term = await this.termsRepo.findOne({ where: { id } });
    if (!term) throw new NotFoundException('Terms not found');
    await this.termsRepo.remove(term);
  }

  async toggleStatus(id: number): Promise<TermsConditions> {
    const term = await this.termsRepo.findOne({ where: { id } });
    if (!term) throw new NotFoundException('Terms not found');
    
    term.isActive = !term.isActive;
    return this.termsRepo.save(term);
  }
}