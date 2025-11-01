import { Module } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Page } from './entities/page.entity';
import { RoleModulePermission } from 'src/roles/entities/role-module-permission/role-module-permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Page, RoleModulePermission])],
  controllers: [PagesController],
  providers: [PagesService],
  exports: [PagesService],
})
export class PagesModule {}
