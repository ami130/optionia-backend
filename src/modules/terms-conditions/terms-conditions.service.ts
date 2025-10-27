import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TermsConditions } from './entities/terms-conditions.entity';
import { CreateTermsDto } from './dto/create-terms.dto';
import { UpdateTermsDto } from './dto/update-terms.dto';

@Injectable()
export class TermsConditionsService {
  constructor(
    @InjectRepository(TermsConditions)
    private readonly termsRepo: Repository<TermsConditions>,
  ) {}

  async create(dto: CreateTermsDto): Promise<TermsConditions> {
    const existing = await this.termsRepo.findOne({ where: { slug: dto.slug } });
    if (existing) throw new BadRequestException('Slug already exists');

    const term = this.termsRepo.create(dto);
    return this.termsRepo.save(term);
  }

  async findAll(): Promise<TermsConditions[]> {
    return this.termsRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(slug: string): Promise<TermsConditions> {
    const term = await this.termsRepo.findOne({ where: { slug } });
    if (!term) throw new NotFoundException('Terms not found');
    return term;
  }

  async update(id: number, dto: UpdateTermsDto): Promise<TermsConditions> {
    const term = await this.termsRepo.findOne({ where: { id } });
    if (!term) throw new NotFoundException('Terms not found');

    Object.assign(term, dto);
    return this.termsRepo.save(term);
  }

  async remove(id: number): Promise<void> {
    const term = await this.termsRepo.findOne({ where: { id } });
    if (!term) throw new NotFoundException('Terms not found');
    await this.termsRepo.remove(term);
  }
}
