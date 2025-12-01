// src/modules/partner-applications/partner-applications.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { PartnerApplication } from './entities/partner-application.entity';
import { CreatePartnerApplicationDto, UpdatePartnerApplicationDto } from './dto/create-partner-application.dto';

@Injectable()
export class PartnerApplicationsService {
  constructor(
    @InjectRepository(PartnerApplication)
    private readonly applicationRepo: Repository<PartnerApplication>,
  ) {}

  // ✅ CREATE (Public)
  async create(dto: CreatePartnerApplicationDto): Promise<any> {
    if (!dto.name || !dto.email) {
      throw new BadRequestException('Name and email are required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dto.email)) {
      throw new BadRequestException('Invalid email format');
    }

    const application = this.applicationRepo.create({
      ...dto,
      contacted: dto.contacted || false,
    });

    const savedApplication = await this.applicationRepo.save(application);
    return this.transformResponse(savedApplication);
  }

  // ✅ GET ALL WITH FILTERS (Admin)
  async findAll(filters?: {
    contacted?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    partnerType?: string;
  }): Promise<{ data: any[]; meta: any }> {
    const where: any = {};
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    if (filters?.contacted !== undefined) {
      where.contacted = filters.contacted;
    }

    if (filters?.partnerType) {
      where.partnerType = filters.partnerType;
    }

    if (filters?.search) {
      where.name = Like(`%${filters.search}%`);
    }

    const total = await this.applicationRepo.count({ where });

    const applications = await this.applicationRepo.find({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const data = applications.map(app => this.transformResponse(app));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  // ✅ GET SINGLE (Admin)
  async findOne(id: number): Promise<any> {
    const application = await this.applicationRepo.findOne({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException(`Partner application with ID ${id} not found`);
    }

    return this.transformResponse(application);
  }

  // ✅ UPDATE (Admin)
  async update(id: number, dto: UpdatePartnerApplicationDto): Promise<any> {
    const application = await this.applicationRepo.findOne({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException(`Partner application with ID ${id} not found`);
    }

    Object.assign(application, dto);
    const updatedApplication = await this.applicationRepo.save(application);
    return this.transformResponse(updatedApplication);
  }

  // ✅ UPDATE CONTACTED STATUS ONLY (Admin)
  async updateContacted(id: number, contacted: boolean): Promise<any> {
    const application = await this.applicationRepo.findOne({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException(`Partner application with ID ${id} not found`);
    }

    application.contacted = contacted;
    const updatedApplication = await this.applicationRepo.save(application);
    
    return {
      message: 'Contacted status updated successfully',
      data: this.transformResponse(updatedApplication)
    };
  }

  // ✅ DELETE (Admin)
  async remove(id: number): Promise<void> {
    const application = await this.applicationRepo.findOne({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException(`Partner application with ID ${id} not found`);
    }

    await this.applicationRepo.remove(application);
  }

  // ✅ Transform response
  private transformResponse(application: PartnerApplication): any {
    return {
      id: application.id,
      name: application.name,
      email: application.email,
      companyWebsite: application.companyWebsite,
      partnerType: application.partnerType,
      message: application.message,
      contacted: application.contacted,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    };
  }
}