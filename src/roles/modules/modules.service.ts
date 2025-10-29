/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModuleEntity } from '../entities/module/module.entity';
import { CreateModuleDto } from '../dto/create-module.dto';
import { ModulesForRole } from 'src/common/const/common.contstant';
import { UpdateModuleDto } from '../dto/update-module.dto';
import { RolesService } from '../roles.service';

@Injectable()
export class ModulesService {
  constructor(
    @InjectRepository(ModuleEntity)
    private readonly moduleRepo: Repository<ModuleEntity>,
    private readonly rolesService: RolesService,
  ) {}

  async create(dto: CreateModuleDto) {
    const mod = this.moduleRepo.create({
      ...dto,
      slug: dto.slug || dto.name.toLowerCase().replace(/\s+/g, '-'),
    });
    // Save module first
    const savedModule = await this.moduleRepo.save(mod);

    // Assign all permissions of this module to Admin
    await this.rolesService.assignAllPermissionsToAdmin();

    return savedModule;
  }

  async findAll() {
    const modules = await this.moduleRepo.find({
      relations: ['roleModulePermissions', 'roleModulePermissions.permission'],
    });

    return modules.map((mod) => {
      // Deduplicate permissions by ID
      const permissionMap = new Map<number, any>();
      for (const rmp of mod.roleModulePermissions) {
        if (!permissionMap.has(rmp.permission.id)) {
          permissionMap.set(rmp.permission.id, {
            id: rmp.permission.id,
            name: rmp.permission.name,
            slug: rmp.permission.slug,
            createdAt: rmp.permission.createdAt,
            updatedAt: rmp.permission.updatedAt,
          });
        }
      }

      return {
        id: mod.id,
        name: mod.name,
        slug: mod.slug,
        createdAt: mod.createdAt,
        updatedAt: mod.updatedAt,
        permission: Array.from(permissionMap.values()),
      };
    });
  }

  async update(id: number, dto: UpdateModuleDto) {
    const mod = await this.moduleRepo.findOne({ where: { id } });
    if (!mod) {
      throw new NotFoundException('Module not found');
    }
    mod.name = dto.name;
    return this.moduleRepo.save(mod);
  }

  async seedBaseModules() {
    for (const data of ModulesForRole) {
      const exists = await this.moduleRepo.findOne({ where: { slug: data.slug } });
      if (!exists) await this.moduleRepo.save(this.moduleRepo.create(data));
    }
  }
}
