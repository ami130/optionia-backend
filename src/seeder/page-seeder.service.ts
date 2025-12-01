// src/seeder/page-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from '../modules/pages/entities/page.entity';

@Injectable()
export class PageSeederService {
  private readonly logger = new Logger('PageSeeder');

  constructor(
    @InjectRepository(Page)
    private readonly pageRepo: Repository<Page>,
  ) {}

  async seedBlogPage() {
    this.logger.log('📄 Seeding blog page...');

    try {
      // Check if blog page already exists
      const existingBlogPage = await this.pageRepo.findOne({
        where: [{ slug: 'blog' }, { url: 'blog' }],
      });

      if (existingBlogPage) {
        this.logger.log('ℹ️ Blog page already exists');
        return existingBlogPage;
      }

      // Create blog page
      const blogPage = this.pageRepo.create({
        name: 'Blog',
        title: 'Blog - Optionia',
        description: 'Read our latest blog posts and articles on various topics',
        slug: 'blog',
        url: '/blog',
        isActive: true,
        metaData: {
          metaTitle: 'Blog - Optionia | Latest Articles & Insights',
          metaDescription: 'Explore our latest blog posts, articles, and insights on technology, business, and more.',
          keywords: ['blog', 'articles', 'insights', 'optionia'],
        },
        content: `
          <div class="blog-page">
            <h1>Welcome to Our Blog</h1>
            <p>Discover the latest insights, tutorials, and news from our team.</p>
          </div>
        `,
      });

      const savedPage = await this.pageRepo.save(blogPage);
      this.logger.log('✅ Blog page created successfully');

      return savedPage;
    } catch (error) {
      this.logger.error('❌ Failed to seed blog page:', error);
      throw error;
    }
  }

  async seedDefaultPages() {
    this.logger.log('🏗️ Seeding default pages...');

    const defaultPages = [
      {
        name: 'Home',
        title: 'Home - Optionia',
        description: 'Welcome to Optionia',
        slug: 'home',
        url: '/',
        isActive: true,
        metaData: {
          metaTitle: 'Optionia - Home',
          metaDescription: 'Welcome to Optionia, your platform for amazing content',
        },
      },
      {
        name: 'About',
        title: 'About Us - Optionia',
        description: 'Learn more about our company',
        slug: 'about',
        url: '/about',
        isActive: true,
        metaData: {
          metaTitle: 'About Us - Optionia',
          metaDescription: 'Learn more about Optionia and our mission',
        },
      },
      {
        name: 'Contact',
        title: 'Contact Us - Optionia',
        description: 'Get in touch with us',
        slug: 'contact',
        url: '/contact',
        isActive: true,
        metaData: {
          metaTitle: 'Contact Us - Optionia',
          metaDescription: 'Contact our team for any inquiries',
        },
      },
      {
        name: 'Terms of Service',
        title: 'Terms of Service - Optionia',
        description: 'Get in touch with us',
        slug: 'terms-of-service',
        url: '/terms-of-service',
        isActive: true,
        metaData: {
          metaTitle: 'Terms of Service Us - Optionia',
          metaDescription: 'Terms of Service our team for any inquiries',
        },
      },
      {
        name: 'Privacy Policy',
        title: 'Privacy Policy - Optionia',
        description: 'Get in touch with us',
        slug: 'privacy-policy',
        url: '/privacy-policy',
        isActive: true,
        metaData: {
          metaTitle: 'Privacy Policy Us - Optionia',
          metaDescription: 'Privacy Policy our team for any inquiries',
        },
      },
      {
        name: 'Partner',
        title: 'Partner - Optionia',
        description: 'Get in touch with us',
        slug: 'partner',
        url: '/partner',
        isActive: true,
        metaData: {
          metaTitle: 'Partner - Optionia',
          metaDescription: 'Partner our team for any inquiries',
        },
      },
      {
        name: 'Pricing',
        title: 'Pricing - Optionia',
        description: 'Get in touch with us',
        slug: 'pricing',
        url: '/pricing',
        isActive: true,
        metaData: {
          metaTitle: 'Pricing - Optionia',
          metaDescription: 'Pricing our team for any inquiries',
        },
      },
    ];

    try {
      for (const pageData of defaultPages) {
        const existingPage = await this.pageRepo.findOne({
          where: [{ slug: pageData.slug }, { url: pageData.url }],
        });

        if (!existingPage) {
          const page = this.pageRepo.create(pageData);
          await this.pageRepo.save(page);
          this.logger.log(`✅ ${pageData.name} page created`);
        } else {
          this.logger.log(`ℹ️ ${pageData.name} page already exists`);
        }
      }

      this.logger.log('🎉 Default pages seeding completed');
    } catch (error) {
      this.logger.error('❌ Failed to seed default pages:', error);
      throw error;
    }
  }
}
