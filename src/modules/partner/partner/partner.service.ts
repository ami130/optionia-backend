// src/modules/partners/partners.service.ts
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partner } from './entities/partner.entity';
import { CreatePartnerDto, UpdatePartnerDto } from './dto/create-partner.dto';
import { PartnerCategory } from '../partner-category/entities/partner-category.entity';
import { Page } from 'src/modules/pages/entities/page.entity';
import { UploadsService } from 'src/modules/uploads/uploads.service';

@Injectable()
export class PartnersService {
  constructor(
    @InjectRepository(Partner)
    private readonly partnerRepo: Repository<Partner>,
    @InjectRepository(PartnerCategory)
    private readonly categoryRepo: Repository<PartnerCategory>,
    @InjectRepository(Page)
    private readonly pageRepo: Repository<Page>,
    private readonly uploadsService: UploadsService,
  ) {}

  async create(data: CreatePartnerDto, files?: Express.Multer.File[]) {
    // ✅ Validate name length
    if (data.name.length > 80) {
      throw new BadRequestException('Name must be 80 characters or less');
    }

    // ✅ Validate description length
    if (data.description && data.description.length > 150) {
      throw new BadRequestException('Description must be 150 characters or less');
    }

    // ✅ Check if partner with same name exists
    const existingPartner = await this.partnerRepo.findOne({
      where: { name: data.name },
    });
    if (existingPartner) {
      throw new ConflictException(`A partner with name "${data.name}" already exists`);
    }

    // ✅ Check if category exists
    const category = await this.categoryRepo.findOne({
      where: { id: data.categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${data.categoryId} not found`);
    }

    // ✅ Handle uploaded files using UploadsService
    let logoPath = data.logo;
    if (files?.length) {
      const fileData: any = {};
      this.uploadsService.mapFilesToData(files, fileData, ['logo']);

      if (fileData['logo']) {
        logoPath = fileData['logo'];
        console.log('✅ Logo file processed:', logoPath);
      }
    }

    // ✅ Create partner entity
    const partner = this.partnerRepo.create({
      ...data,
      logo: logoPath,
      category,
    });

    // ✅ Save partner
    const savedPartner = await this.partnerRepo.save(partner);
    console.log('💾 Saved partner:', savedPartner.name);

    return this.transformPartnerResponse(savedPartner);
  }

  // ✅ GET PARTNERS LIST WITH PAGE (main endpoint like blog)
  async getPartnersListWithPage(filters?: { status?: boolean; categoryId?: number }) {
    try {
      console.log('🔍 Getting partners list with page...');

      // ✅ Find existing partner page with multiple fallbacks
      let page = await this.pageRepo.findOne({
        where: { url: '/partner', isActive: true },
      });

      // If not found by URL, try by slug
      if (!page) {
        page = await this.pageRepo.findOne({
          where: { slug: 'partner', isActive: true },
        });
      }

      // Get all partners based on filters
      const where: any = {};
      if (filters?.status !== undefined) {
        where.status = filters.status;
      } else {
        where.status = true; // Default to active partners
      }

      if (filters?.categoryId) {
        where.categoryId = filters.categoryId;
      }

      const partners = await this.partnerRepo.find({
        where,
        relations: ['category'],
        order: { createdAt: 'DESC' },
      });

      const transformedPartners = partners.map((partner) => this.transformPartnerResponse(partner));

      // ✅ If no page exists, use virtual page
      if (!page) {
        console.log('ℹ️ No partner page found, using virtual page');

        const virtualPage = {
          id: 0,
          name: 'Partner',
          title: 'Partner - Optionia',
          description: 'Our trusted partners and collaborators',
          slug: 'partner',
          url: '/partner',
          subtitle: null,
          navbarShow: true,
          order: 0,
          isActive: true,
          type: 'partner',
          content: null,
          metaTitle: 'Partner - Optionia',
          metaDescription: 'Discover our trusted partners and collaborators',
          metaKeywords: ['partner', 'collaborators', 'trusted'],
          canonicalUrl: '/partner',
          metaImage: null,
          backgroundImage: null,
          backgroundColor: null,
          textColor: null,
          metaData: {
            metaTitle: 'Partner - Optionia',
            metaDescription: 'Discover our trusted partners and collaborators',
            keywords: ['partner', 'collaborators', 'trusted'],
          },
          parentId: null,
          parent: null,
          children: [],
          partners: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        return {
          page: virtualPage,
          partners: transformedPartners,
        };
      }

      // ✅ Page exists, use it
      console.log('✅ Using existing partner page:', page.id);

      return {
        page: { ...page },
        partners: transformedPartners,
      };
    } catch (error) {
      console.error('❌ Error in getPartnersListWithPage:', error);

      const fallbackPage = {
        id: 0,
        name: 'Partner',
        title: 'Partner - Optionia',
        description: 'Our trusted partners and collaborators',
        slug: 'partner',
        url: '/partner',
        subtitle: null,
        navbarShow: true,
        order: 0,
        isActive: true,
        type: 'partner',
        content: null,
        metaTitle: 'Partner - Optionia',
        metaDescription: 'Discover our trusted partners and collaborators',
        metaKeywords: ['partner', 'collaborators', 'trusted'],
        canonicalUrl: '/partner',
        metaImage: null,
        backgroundImage: null,
        backgroundColor: null,
        textColor: null,
        metaData: {
          metaTitle: 'Partner - Optionia',
          metaDescription: 'Discover our trusted partners and collaborators',
          keywords: ['partner', 'collaborators', 'trusted'],
        },
        parentId: null,
        parent: null,
        children: [],
        partners: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return {
        page: fallbackPage,
        partners: [],
      };
    }
  }

  async findOne(id: number) {
    const partner = await this.partnerRepo.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    return this.transformPartnerResponse(partner);
  }

  async update(id: number, data: UpdatePartnerDto, files?: Express.Multer.File[]) {
    const partner = await this.partnerRepo.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    // ✅ Validate name length if updating
    if (data.name && data.name.length > 80) {
      throw new BadRequestException('Name must be 80 characters or less');
    }

    // ✅ Validate description length if updating
    if (data.description && data.description.length > 150) {
      throw new BadRequestException('Description must be 150 characters or less');
    }

    // ✅ Check if new name already exists (excluding current)
    if (data.name && data.name !== partner.name) {
      const existingPartner = await this.partnerRepo.findOne({
        where: { name: data.name },
      });
      if (existingPartner && existingPartner.id !== id) {
        throw new ConflictException(`Another partner with name "${data.name}" already exists`);
      }
    }

    // ✅ Handle category update
    if (data.categoryId && data.categoryId !== partner.categoryId) {
      const category = await this.categoryRepo.findOne({
        where: { id: data.categoryId },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      partner.category = category;
      partner.categoryId = data.categoryId;
    }

    // ✅ Handle uploaded files using UploadsService
    if (files?.length) {
      const fileData: any = {};
      this.uploadsService.mapFilesToData(files, fileData, ['logo']);

      if (fileData['logo']) {
        partner.logo = fileData['logo'];
        console.log('✅ Updated logo:', partner.logo);
      }
    }

    // ✅ Update other fields
    if (data.name !== undefined) partner.name = data.name;
    if (data.description !== undefined) partner.description = data.description;
    if (data.websiteLink !== undefined) partner.websiteLink = data.websiteLink;
    if (data.status !== undefined) partner.status = data.status;
    if (data.meta_data !== undefined) partner.meta_data = data.meta_data;
    if (data.logo !== undefined && !files?.length) partner.logo = data.logo;

    // ✅ Save updated partner
    const updatedPartner = await this.partnerRepo.save(partner);
    console.log('💾 Updated partner:', updatedPartner.name);

    return this.transformPartnerResponse(updatedPartner);
  }

  async remove(id: number) {
    const partner = await this.partnerRepo.findOne({ where: { id } });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    // Optional: Delete logo file if exists
    if (partner.logo) {
      try {
        const fs = require('fs');
        const fullPath = '.' + partner.logo;
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (error) {
        console.warn('Could not delete logo file:', error);
      }
    }

    return this.partnerRepo.remove(partner);
  }

  async toggleStatus(id: number) {
    const partner = await this.partnerRepo.findOne({ where: { id } });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    partner.status = !partner.status;
    return this.partnerRepo.save(partner);
  }

  async getByCategory(categorySlug: string) {
    const partners = await this.partnerRepo
      .createQueryBuilder('partner')
      .leftJoinAndSelect('partner.category', 'category')
      .where('category.slug = :categorySlug', { categorySlug })
      .andWhere('partner.status = :status', { status: true })
      .orderBy('partner.createdAt', 'DESC')
      .getMany();

    return partners.map((partner) => this.transformPartnerResponse(partner));
  }

  private transformPartnerResponse(partner: Partner) {
    return {
      id: partner.id,
      name: partner.name,
      description: partner.description,
      logo: partner.logo,
      websiteLink: partner.websiteLink,
      status: partner.status,
      category: partner.category
        ? {
            id: partner.category.id,
            name: partner.category.name,
            slug: partner.category.slug,
          }
        : null,
      meta_data: partner.meta_data,
      createdAt: partner.createdAt,
      updatedAt: partner.updatedAt,
    };
  }
}
