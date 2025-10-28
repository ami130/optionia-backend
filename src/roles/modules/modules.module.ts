import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModulesService } from './modules.service';
import { ModulesController } from './modules.controller';
import { ModuleEntity } from '../entities/module/module.entity';
import { RolesModule } from '../roles.module';

@Module({
  imports: [TypeOrmModule.forFeature([ModuleEntity]),RolesModule],
  providers: [ModulesService],
  controllers: [ModulesController],
  exports: [ModulesService],
})
export class ModulesModule {}
