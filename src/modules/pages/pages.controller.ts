// pages.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseArrayPipe,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/enum/userRole.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadsService } from '../uploads/uploads.service';

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('backgroundImage', {
      storage: new UploadsService().getFileStorage(),
      fileFilter: new UploadsService().fileFilter,
    }),
  )
  create(@Body() createPageDto: CreatePageDto, @UploadedFile() file?: Express.Multer.File) {
    return this.pagesService.create(createPageDto, file);
  }

  @Get()
  findAll() {
    return this.pagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pagesService.findOneById(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('backgroundImage', {
      storage: new UploadsService().getFileStorage(),
      fileFilter: new UploadsService().fileFilter,
    }),
  )
  update(@Param('id') id: string, @Body() updatePageDto: UpdatePageDto, @UploadedFile() file?: Express.Multer.File) {
    return this.pagesService.update(+id, updatePageDto, file);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.pagesService.remove(+id);
  }
}
