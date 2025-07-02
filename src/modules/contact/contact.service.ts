import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Contact } from './entities/contact.entity';
import { Like, Repository } from 'typeorm';
import { createContactDto } from './dto/Create-contact.dto';
import { commonQueryDto } from '../blog/dto/blog-query.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  async createContact(createContactDto: createContactDto): Promise<Contact> {
    const result = this.contactRepository.create(createContactDto);
    return this.contactRepository.save(result);
  }

  async getAllContact(query: commonQueryDto): Promise<{ data: Contact[]; count: number }> {
    const { page = 1, limit = 10, search = '', order = 'DESC', sortBy = 'createdAt' } = query;
    const skip = (page - 1) * limit;

    // Build query
    const [data, count] = await this.contactRepository.findAndCount({
      where: [{ name: Like(`%${search}%`) }, { email: Like(`%${search}%`) }, { message: Like(`%${search}%`) }],
      order: {
        [sortBy]: order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
      },
      take: limit,
      skip,
    });

    return { data, count };
  }

  async deleteContact(id: number) {
    const result = await this.contactRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }
    return { deleted: true, id };
  }

  async contactDetails(id: number) {
    const result = await this.contactRepository.findOne({ where: { id: id } });

    if (!result) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    return result;
  }
}
