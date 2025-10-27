import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Page } from './entities/page.entity';
import { IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
  ) {}

  async create(createPageDto: CreatePageDto) {
    try {
      // Extract children if any
      const { children, ...parentData } = createPageDto;

      // Create parent page
      const parentPage = this.pageRepository.create(parentData);
      await this.pageRepository.save(parentPage);

      // Insert children if provided
      if (children && children.length > 0) {
        for (const childDto of children) {
          const childPage = this.pageRepository.create({
            ...childDto,
            parentId: parentPage.id,
          });
          await this.pageRepository.save(childPage);
        }
      }

      // Reload parent with children
      return this.pageRepository.findOne({
        where: { id: parentPage.id },
        relations: ['children'],
      });
    } catch (error) {
      // Foreign key violation
      if ((error as any).code === '23503') {
        throw new BadRequestException({
          message: `The parent ID ${createPageDto.parentId} does not exist.`,
          suggestion: 'Create the parent page first or set parentId to null.',
          originalError: error.message,
        });
      }

      // Unique constraint violation
      if ((error as any).code === '23505') {
        // Extract which column caused the issue
        const detail = (error as any).detail;
        throw new BadRequestException({
          message: 'A page with the same title or URL already exists.',
          suggestion: 'Use a different title and URL.',
          originalError: detail,
        });
      }

      // Generic fallback
      throw new BadRequestException({
        message: 'Failed to create page due to server error.',
        originalError: error.message,
      });
    }
  }

  async findAll() {
    return this.pageRepository.find({
      where: { isActive: true, parentId: IsNull() }, // ONLY top-level pages
      relations: ['children'], // Include children
      order: { order: 'ASC' },
    });
  }

  async findOneById(id: number) {
    const page = await this.pageRepository.findOne({
      where: { id, isActive: true },
      relations: ['children'],
    });

    if (!page) {
      throw new NotFoundException(`Page with id "${id}" not found`);
    }

    return page;
  }

  async update(id: number, updatePageDto: UpdatePageDto) {
    try {
      const existingPage = await this.pageRepository.findOne({
        where: { id },
        relations: ['children'],
      });

      if (!existingPage) throw new NotFoundException(`Page with ID ${id} not found.`);

      const { children, ...parentData } = updatePageDto;

      // Filter out undefined values
      const parentUpdateData = Object.fromEntries(Object.entries(parentData).filter(([_, v]) => v !== undefined));

      // Update parent only if there are values
      if (Object.keys(parentUpdateData).length > 0) {
        await this.pageRepository.update(id, parentUpdateData);
      }

      // Update/create/delete children
      if (children && children.length > 0) {
        await this.handleChildrenUpdate(existingPage, children);
      }

      return await this.pageRepository.findOne({
        where: { id },
        relations: ['children'],
      });
    } catch (error) {
      this.handleUpdateError(error);
    }
  }

  private async handleChildrenUpdate(parentPage: Page, childrenDtos: any[]): Promise<void> {
    const existingChildren = parentPage.children || [];
    const childrenToKeep: number[] = [];

    for (const childDto of childrenDtos) {
      if (childDto.id) {
        // ✅ Update existing child
        const existingChild = existingChildren.find((c) => c.id === childDto.id);
        if (existingChild) {
          // Remove ID from update data to avoid conflicts
          const { id, ...updateData } = childDto;
          await this.pageRepository.update(id, updateData);
          childrenToKeep.push(id);
        }
      } else {
        // ✅ Create new child
        const newChild = this.pageRepository.create({
          ...childDto,
          parentId: parentPage.id,
        });
        const savedChild = (await this.pageRepository.save(newChild)) as unknown as Page;
        childrenToKeep.push(savedChild.id);
      }
    }

    // ✅ Delete children that were removed from the list
    const childrenToDelete = existingChildren
      .filter((child) => !childrenToKeep.includes(child.id))
      .map((child) => child.id);

    if (childrenToDelete.length > 0) {
      await this.pageRepository.delete(childrenToDelete);
    }
  }

  private handleUpdateError(error: any): never {
    if (error.code === '23505') {
      // Unique constraint violation
      const detail = error.detail || '';
      let message = 'A page with the same title or URL already exists.';

      if (detail.includes('title')) {
        message = 'A page with this title already exists.';
      } else if (detail.includes('url')) {
        message = 'A page with this URL already exists.';
      }

      throw new BadRequestException({
        message,
        originalError: detail,
      });
    }

    throw new BadRequestException({
      message: 'Failed to update page due to server error.',
      originalError: error.message,
    });
  }

  async remove(id: number) {
    const result = await this.pageRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Page with id "${id}" not found`);
    }

    return { message: `Page with id "${id}" has been deleted` };
  }
}
