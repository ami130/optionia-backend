import { createContactDto } from './dto/Create-contact.dto';
import { ContactService } from './contact.service';
import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Contact } from './entities/contact.entity';
import { commonQueryDto } from '../blog/dto/blog-query.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/enum/userRole.enum';

@Controller('contact')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Post()
  async createContact(@Body() createContactDto: createContactDto): Promise<Contact> {
    return this.contactService.createContact(createContactDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async getAllContact(@Query() query: commonQueryDto): Promise<{ data: Contact[]; count: number }> {
    return this.contactService.getAllContact(query);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async deleteBlog(@Param('id') id: string): Promise<any> {
    return await this.contactService.deleteContact(+id);
  }

  @Get('/:id')
  async contactDetails(@Param('id') id: string): Promise<any> {
    return this.contactService.contactDetails(+id);
  }
}
