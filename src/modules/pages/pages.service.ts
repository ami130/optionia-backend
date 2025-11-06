// pages.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Page } from './entities/page.entity';
import { IsNull, Repository } from 'typeorm';
import { slugify } from 'src/common/config/slugify';
import { UploadsService } from '../uploads/uploads.service';
import { PageChildUpdateDto } from './types/page-update.interface';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page) private readonly pageRepo: Repository<Page>,
    private readonly uploadsService: UploadsService,
  ) {}

  async create(dto: CreatePageDto, file?: Express.Multer.File) {
    const { children, ...parentData } = dto;

    // Ensure slug is generated if not provided
    if (!parentData.slug || parentData.slug.trim() === '') {
      parentData.slug = slugify(parentData.title);
    }

    // Handle file upload - create a new object with proper typing
    const pageData: Partial<Page> = {
      name: parentData.name,
      title: parentData.title,
      url: parentData.url,
      slug: parentData.slug,
      subtitle: parentData.subtitle,
      description: parentData.description,
      navbarShow: parentData.navbarShow ?? true,
      type: parentData.type ?? 'general',
      content: parentData.content,
      metaTitle: parentData.metaTitle,
      metaDescription: parentData.metaDescription,
      canonicalUrl: parentData.canonicalUrl,
      backgroundColor: parentData.backgroundColor,
      textColor: parentData.textColor,
      order: parentData.order ?? 0,
      isActive: parentData.isActive ?? true,
      metaKeywords: parentData.metaKeywords,
      parentId: parentData.parentId,
    };

    if (file) {
      pageData.backgroundImage = `/public/uploads/${file.filename}`;
    }

    // Create the main page
    const page = this.pageRepo.create(pageData);
    await this.pageRepo.save(page);

    // Handle children if provided
    if (children && children.length > 0) {
      for (const childDto of children) {
        const childData: Partial<Page> = {
          name: childDto.title, // Use title as name for children
          title: childDto.title,
          url: childDto.url,
          content: childDto.content,
          order: childDto.order ?? 0,
          isActive: childDto.isActive ?? true,
          metaTitle: childDto.metaTitle,
          metaDescription: childDto.metaDescription,
          parentId: page.id,
          type: 'child',
        };

        const child = this.pageRepo.create(childData);
        await this.pageRepo.save(child);
      }
    }

    return this.pageRepo.findOne({
      where: { id: page.id },
      relations: ['children'],
    });
  }

  async findAll() {
    return this.pageRepo.find({
      where: {
        isActive: true,
        parentId: IsNull(),
      },
      relations: ['children'],
      order: { order: 'ASC' },
    });
  }

  async findOneById(id: number) {
    const page = await this.pageRepo.findOne({
      where: { id, isActive: true },
      relations: ['children'],
    });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async update(id: number, dto: UpdatePageDto, file?: Express.Multer.File) {
    const page = await this.pageRepo.findOne({
      where: { id },
      relations: ['children'],
    });
    if (!page) throw new NotFoundException('Page not found');

    const { children, ...parentData } = dto;

    // Create update data with proper typing - only include defined fields
    const updateData: Partial<Page> = {};

    // Add only the fields that are provided
    if (parentData.name !== undefined) updateData.name = parentData.name;
    if (parentData.title !== undefined) updateData.title = parentData.title;
    if (parentData.url !== undefined) updateData.url = parentData.url;
    if (parentData.slug !== undefined) updateData.slug = parentData.slug;
    if (parentData.subtitle !== undefined) updateData.subtitle = parentData.subtitle;
    if (parentData.description !== undefined) updateData.description = parentData.description;
    if (parentData.navbarShow !== undefined) updateData.navbarShow = parentData.navbarShow;
    if (parentData.type !== undefined) updateData.type = parentData.type;
    if (parentData.content !== undefined) updateData.content = parentData.content;
    if (parentData.metaTitle !== undefined) updateData.metaTitle = parentData.metaTitle;
    if (parentData.metaDescription !== undefined) updateData.metaDescription = parentData.metaDescription;
    if (parentData.canonicalUrl !== undefined) updateData.canonicalUrl = parentData.canonicalUrl;
    if (parentData.backgroundColor !== undefined) updateData.backgroundColor = parentData.backgroundColor;
    if (parentData.textColor !== undefined) updateData.textColor = parentData.textColor;
    if (parentData.order !== undefined) updateData.order = parentData.order;
    if (parentData.isActive !== undefined) updateData.isActive = parentData.isActive;
    if (parentData.metaKeywords !== undefined) updateData.metaKeywords = parentData.metaKeywords;
    if (parentData.parentId !== undefined) updateData.parentId = parentData.parentId;

    // Handle file upload
    if (file) {
      // Remove old file if exists
      if (page.backgroundImage) {
        this.uploadsService.removeFileIfExists(page.backgroundImage);
      }
      updateData.backgroundImage = `/public/uploads/${file.filename}`;
    }

    // Update the main page
    await this.pageRepo.update(id, updateData);

    // Handle children updates
    if (children && children.length > 0) {
      await this.handleChildrenUpdate(page, children);
    }

    return this.pageRepo.findOne({
      where: { id },
      relations: ['children'],
    });
  }

  private async handleChildrenUpdate(parentPage: Page, childrenDtos: any[]) {
    const existingChildren = parentPage.children || [];
    const keepIds: number[] = [];

    for (const childDto of childrenDtos) {
      if (childDto.id) {
        // Update existing child - create proper update data
        const updateData: Partial<Page> = {};

        // Add only the fields that are provided
        if (childDto.title !== undefined) {
          updateData.title = childDto.title;
          updateData.name = childDto.title; // Also update name for consistency
        }
        if (childDto.url !== undefined) updateData.url = childDto.url;
        if (childDto.content !== undefined) updateData.content = childDto.content;
        if (childDto.order !== undefined) updateData.order = childDto.order;
        if (childDto.isActive !== undefined) updateData.isActive = childDto.isActive;
        if (childDto.metaTitle !== undefined) updateData.metaTitle = childDto.metaTitle;
        if (childDto.metaDescription !== undefined) updateData.metaDescription = childDto.metaDescription;

        updateData.parentId = parentPage.id; // Always set parentId

        await this.pageRepo.update(childDto.id, updateData);
        keepIds.push(childDto.id);
      } else {
        // Create new child - create proper child data
        const childData: Partial<Page> = {
          name: childDto.title,
          title: childDto.title,
          url: childDto.url,
          content: childDto.content,
          order: childDto.order ?? 0,
          isActive: childDto.isActive ?? true,
          metaTitle: childDto.metaTitle,
          metaDescription: childDto.metaDescription,
          parentId: parentPage.id,
          type: 'child',
          slug: slugify(childDto.title), // Generate slug for new child
        };

        const newChild = this.pageRepo.create(childData);
        const savedChild = await this.pageRepo.save(newChild);
        keepIds.push(savedChild.id);
      }
    }

    // Delete children that are not in the updated list
    const childrenToDelete = existingChildren.filter((child) => !keepIds.includes(child.id)).map((child) => child.id);

    if (childrenToDelete.length > 0) {
      await this.pageRepo.delete(childrenToDelete);
    }
  }

  async remove(id: number) {
    const page = await this.pageRepo.findOne({ where: { id } });
    if (!page) throw new NotFoundException('Page not found');

    // Remove associated file if exists
    if (page.backgroundImage) {
      this.uploadsService.removeFileIfExists(page.backgroundImage);
    }

    const result = await this.pageRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Page not found');

    return { message: 'Page deleted successfully' };
  }
}
