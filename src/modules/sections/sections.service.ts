import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSectionDto, UpdateSectionDto } from './dto/section.dto';
import * as fs from 'fs';
import * as path from 'path';
import { Section } from './entites/section.entity';
import { SectionItem } from './entites/section-item.entity';

@Injectable()
export class SectionService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionRepo: Repository<Section>,
    @InjectRepository(SectionItem)
    private readonly itemRepo: Repository<SectionItem>,
  ) {}

  private removeFileIfExists(filePath: string) {
    try {
      if (filePath && fs.existsSync(path.join(process.cwd(), filePath))) {
        fs.unlinkSync(path.join(process.cwd(), filePath));
      }
    } catch (err) {
      console.error('File deletion failed:', err.message);
    }
  }

  async getAll() {
    return this.sectionRepo.find({
      order: { order: 'ASC' },
    });
  }

  async getOne(id: number) {
    const section = await this.sectionRepo.findOne({ where: { id } });
    if (!section) throw new NotFoundException('Section not found');
    return section;
  }

  async create(dto: CreateSectionDto) {
    try {
      const section = this.sectionRepo.create(dto);
      return await this.sectionRepo.save(section);
    } catch (error) {
      if (error.code === '23505') {
        // PostgreSQL unique violation
        const detail = error.detail; // e.g. 'Key (name)=(course_categories) already exists.'
        throw new BadRequestException(`Duplicate entry: ${detail}`);
      }
      throw error;
    }
  }

async updateSection(id: number, dto: UpdateSectionDto) {
    const section = await this.sectionRepo.findOne({ where: { id } });
    if (!section) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }

    Object.assign(section, dto); // update fields

    try {
      return await this.sectionRepo.save(section);
    } catch (error) {
      if (error.code === '23505') {
        const detail = error.detail;
        throw new BadRequestException(`Duplicate entry: ${detail}`);
      }
      throw error;
    }
  }

  async update(id: number, data: UpdateSectionDto) {
    const section = await this.sectionRepo.findOne({ where: { id } });
    if (!section) throw new NotFoundException('Section not found');

    // Remove old images if replaced
    if (data.image && section.image && data.image !== section.image) this.removeFileIfExists(section.image);

    if (data.backgroundImage && section.backgroundImage && data.backgroundImage !== section.backgroundImage)
      this.removeFileIfExists(section.backgroundImage);

    Object.assign(section, data);

    // If contents are provided, replace all for simplicity
    if (data.contents) {
      await this.itemRepo.delete({ section: { id: section.id } });
      section.contents = this.itemRepo.create(data.contents);
    }
    try {
      return await this.sectionRepo.save(section);
    } catch (error) {
      if (error.code === '23505') {
        const detail = error.detail;
        throw new BadRequestException(`Duplicate entry: ${detail}`);
      }
      throw error;
    }
    // return await this.sectionRepo.save(section);
  }

  async delete(id: number) {
    const section = await this.sectionRepo.findOne({ where: { id } });
    if (!section) throw new NotFoundException('Section not found');

    if (section.image) this.removeFileIfExists(section.image);
    if (section.backgroundImage) this.removeFileIfExists(section.backgroundImage);

    await this.sectionRepo.remove(section);
    return { message: 'Section deleted successfully' };
  }
}
