// src/modules/website-data/website-data.controller.ts
import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { WebsiteDataService } from './website-data.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/enum/userRole.enum';
import { UploadsService } from '../uploads/uploads.service';
import { CreateWebsiteDataDto } from './dto/website-data.dto';

@Controller('website-data')
export class WebsiteDataController {
  constructor(
    private readonly websiteDataService: WebsiteDataService,
    private readonly uploadsService: UploadsService,
  ) {}

  private parseMetaKeywords(data: any) {
    if (data.metaKeywords && typeof data.metaKeywords === 'string') {
      try {
        const parsed = JSON.parse(data.metaKeywords.trim());
        if (!Array.isArray(parsed)) throw new Error();
        data.metaKeywords = parsed;
      } catch {
        throw new BadRequestException('metaKeywords must be a valid JSON array');
      }
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: new UploadsService().getFileStorage(),
      fileFilter: new UploadsService().fileFilter,
    }),
  )
  async create(@UploadedFiles() files: Express.Multer.File[], @Body() data: CreateWebsiteDataDto) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }

    // Map uploaded files to DTO
    this.uploadsService.mapFilesToData(files, data, ['favicon', 'baseLogo', 'secondaryLogo']);

    // Parse metaKeywords if string
    this.parseMetaKeywords(data);

    return this.websiteDataService.create(data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: new UploadsService().getFileStorage(),
      fileFilter: new UploadsService().fileFilter,
    }),
  )
  async update(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() data: Partial<CreateWebsiteDataDto>,
  ) {
    // Get existing record
    const existing = await this.websiteDataService.getById(+id);

    // Map uploaded files and remove previous images
    this.uploadsService.mapFilesToData(files, data, ['favicon', 'baseLogo', 'secondaryLogo'], existing);

    // Parse metaKeywords if string
    this.parseMetaKeywords(data);

    return this.websiteDataService.update(+id, data);
  }

  @Get()
  get() {
    return this.websiteDataService.get();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  delete(@Param('id') id: string) {
    return this.websiteDataService.delete(+id);
  }
}

// @Controller('website-data')
// export class WebsiteDataController {
//   constructor(
//     private readonly websiteDataService: WebsiteDataService,
//     private readonly uploadsService: UploadsService,
//   ) {}

//   private handleFiles(files: Express.Multer.File[], data: any) {
//     this.uploadsService.mapFilesToData(files, data, ['favicon', 'baseLogo', 'secondaryLogo']);
//   }

//   private parseMetaKeywords(data: any) {
//     if (data.metaKeywords && typeof data.metaKeywords === 'string') {
//       try {
//         const parsed = JSON.parse(data.metaKeywords.trim());
//         if (!Array.isArray(parsed)) throw new Error();
//         data.metaKeywords = parsed;
//       } catch {
//         throw new BadRequestException('metaKeywords must be a valid JSON array');
//       }
//     }
//   }

//   @Post()
//   @UseGuards(JwtAuthGuard, RoleGuard)
//   @Roles(UserRole.ADMIN)
//   @UseInterceptors(
//     AnyFilesInterceptor({
//       storage: new UploadsService().getFileStorage(),
//       fileFilter: new UploadsService().fileFilter,
//     }),
//   )
//   async create(@UploadedFiles() files: Express.Multer.File[], @Body() data: CreateWebsiteDataDto) {
//     if (!files || files.length === 0) {
//       throw new BadRequestException('At least one file is required');
//     }

//     this.handleFiles(files, data);
//     this.parseMetaKeywords(data);

//     return this.websiteDataService.create(data);
//   }

//   @Patch(':id')
//   @UseGuards(JwtAuthGuard, RoleGuard)
//   @Roles(UserRole.ADMIN)
//   @UseInterceptors(
//     AnyFilesInterceptor({
//       storage: new UploadsService().getFileStorage(),
//       fileFilter: new UploadsService().fileFilter,
//     }),
//   )
//   async update(
//     @Param('id') id: string,
//     @UploadedFiles() files: Express.Multer.File[],
//     @Body() data: Partial<CreateWebsiteDataDto>,
//   ) {
//     if (files && files.length > 0) {
//       this.handleFiles(files, data);
//     }
//     this.parseMetaKeywords(data);

//     return this.websiteDataService.update(+id, data);
//   }

//   @Get()
//   get() {
//     return this.websiteDataService.get();
//   }

//   @Delete(':id')
//   @UseGuards(JwtAuthGuard, RoleGuard)
//   @Roles(UserRole.ADMIN)
//   delete(@Param('id') id: string) {
//     return this.websiteDataService.delete(+id);
//   }
// }
