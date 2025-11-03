import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Page } from './entities/page.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { slugify } from 'src/common/config/slugify';

@Injectable()
export class PagesService {
  constructor(@InjectRepository(Page) private readonly pageRepo: Repository<Page>) {}

  async create(dto: CreatePageDto) {
    const { children, ...parentData } = dto;

    // Ensure slug is generated if not provided
    if (!parentData.slug || parentData.slug.trim() === '') {
      parentData.slug = slugify(parentData.title);
    }

    const page = this.pageRepo.create(parentData);
    await this.pageRepo.save(page);

    if (children?.length) {
      for (const childDto of children) {
        const child = this.pageRepo.create({ ...childDto, parentId: page.id });
        await this.pageRepo.save(child);
      }
    }

    return this.pageRepo.findOne({ where: { id: page.id }, relations: ['children'] });
  }

  async findAll() {
    return this.pageRepo.find({
      where: { isActive: true, parentId: IsNull() },
      relations: ['children'],
      order: { order: 'ASC' } as any,
    });
  }

  async findOneById(id: number) {
    const page = await this.pageRepo.findOne({ where: { id, isActive: true }, relations: ['children'] });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async update(id: number, dto: UpdatePageDto) {
    const page = await this.pageRepo.findOne({ where: { id }, relations: ['children'] });
    if (!page) throw new NotFoundException('Page not found');

    const { children, ...parentData } = dto;
    await this.pageRepo.update(id, parentData);

    if (children?.length) {
      await this.handleChildrenUpdate(page, children);
    }

    return this.pageRepo.findOne({ where: { id }, relations: ['children'] });
  }

  private async handleChildrenUpdate(parentPage: Page, childrenDtos: any[]) {
    const existingChildren = parentPage.children || [];
    const keepIds: number[] = [];

    for (const child of childrenDtos) {
      if (child.id) {
        await this.pageRepo.update(child.id, child);
        keepIds.push(child.id);
      } else {
        const newChild = this.pageRepo.create({ ...child, parentId: parentPage.id });
        const savedChild = await this.pageRepo.save(newChild);
        // Repository.save may return an entity or an array; normalize and extract id
        const savedChildId = Array.isArray(savedChild) ? (savedChild[0] as Page).id : (savedChild as Page).id;
        keepIds.push(savedChildId);
      }
    }

    const toDelete = existingChildren.filter((c) => !keepIds.includes(c.id)).map((c) => c.id);
    if (toDelete.length) await this.pageRepo.delete(toDelete);
  }

  async remove(id: number) {
    const result = await this.pageRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Page not found');
    return { message: 'Page deleted successfully' };
  }
}
