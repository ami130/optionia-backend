import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Not, Repository } from 'typeorm';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { slugify } from 'src/common/config/slugify';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto) {
    const name = dto.name.trim();
    const slug = dto.slug ? slugify(dto.slug) : slugify(name);

    const exists = await this.categoryRepo.findOne({ where: [{ slug }, { name }] });
    if (exists) {
      throw new ConflictException('Category With same name or slug already exists');
    }

    const category = this.categoryRepo.create({ name, slug });
    return this.categoryRepo.save(category);
  }

  async findAll() {
    return this.categoryRepo.find({ order: { name: 'ASC' } });
  }
  async findOne(id: number) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category Not found');
    }
    return category;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    if (dto.name) category.name = dto.name.trim();
    if (dto.slug) category.slug = slugify(dto.slug);

    const duplicateData = await this.categoryRepo
      .findOne({
        where: [
          { id: Not(id), slug: category.slug },
          { id: Not(id), name: category.name },
        ],
      })
      .catch(() => null);

    if (duplicateData) throw new ConflictException('Another category with same name/slug exists');

    return this.categoryRepo.save(category);
  }
  async remove(id: number) {
    const category = await this.findOne(id);
    return this.categoryRepo.remove(category);
  }
}
