import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePermissionDto } from 'src/roles/dto/create-permission.dto';
import { Permission } from 'src/roles/entities/permission.entity/permission.entity';
import { Repository } from 'typeorm';


@Injectable()
export class PermissionsService {
  constructor(@InjectRepository(Permission) private readonly repo: Repository<Permission>) {}

  async create(dto: CreatePermissionDto) {
    const exists = await this.repo.findOne({ where: [{ name: dto.name }, { slug: dto.slug }] });
    if (exists) throw new ConflictException('Permission exists');
    const p = this.repo.create(dto);
    return this.repo.save(p);
  }

  async findAll() {
    return this.repo.find();
  }
}
