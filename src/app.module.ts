/* eslint-disable prettier/prettier */
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { BlogModule } from './modules/blog/blog.module';
import { ContactModule } from './modules/contact/contact.module';
import { TagModule } from './modules/tag/tag.module';
import { ProductModule } from './modules/product/product.module';
import { ReviewModule } from './modules/review/review.module';
import { CartModule } from './modules/cart/cart.module';
import { WebsiteModule } from './modules/website/website.module';
import { PagesModule } from './modules/pages/pages.module';
import { UploadsController } from './modules/uploads/uploads.controller';
import { UploadsService } from './modules/uploads/uploads.service';
import { UploadsModule } from './modules/uploads/Upload.moudle';
import { WebsiteDataModule } from './modules/website-data/website-data.module';
import { SectionModule } from './modules/sections/sections.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { TermsConditionsModule } from './modules/terms-conditions/terms-conditions.module';
import { ModulesModule } from './roles/modules/modules.module';
import { SharedModule } from './shared-module/shared-module.module';
import { SeederModule } from './seeder/seeder.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ModuleMiddleware } from './common/middlewares/module.middleware';

@Module({
  imports: [
    // ✅ Serve static files - ADD THIS
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public',
    }),

    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    AuthModule,
    UsersModule,
    CommonModule,
    BlogModule,
    ContactModule,
    TagModule,
    ProductModule,
    ReviewModule,
    CartModule,
    WebsiteModule,
    PagesModule,
    UploadsModule,
    WebsiteDataModule,
    SectionModule,
    RolesModule,
    PermissionsModule,
    TermsConditionsModule,
    ModulesModule,
    SharedModule,
    SeederModule,
    CategoriesModule,
  ],
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ModuleMiddleware).forRoutes('*'); // Apply to all routes
  }
}
// /* eslint-disable prettier/prettier */
// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { ConfigModule } from '@nestjs/config';
// import { typeOrmConfig } from './config/typeorm.config';
// import { AuthModule } from './auth/auth.module';
// import { UsersModule } from './users/users.module';
// import { CommonModule } from './common/common.module';
// import { BlogModule } from './modules/blog/blog.module';
// import { ContactModule } from './modules/contact/contact.module';
// import { TagModule } from './modules/tag/tag.module';
// import { ProductModule } from './modules/product/product.module';
// import { ReviewModule } from './modules/review/review.module';
// import { CartModule } from './modules/cart/cart.module';
// import { WebsiteModule } from './modules/website/website.module';
// import { PagesModule } from './modules/pages/pages.module';
// import { UploadsController } from './modules/uploads/uploads.controller';
// import { UploadsService } from './modules/uploads/uploads.service';
// import { UploadsModule } from './modules/uploads/Upload.moudle';
// import { ServeStaticModule } from '@nestjs/serve-static';
// import { join } from 'path';
// import { WebsiteDataModule } from './modules/website-data/website-data.module';
// import { SectionModule } from './modules/sections/sections.module';
// import { RolesModule } from './roles/roles.module';
// import { PermissionsModule } from './permissions/permissions.module';
// import { TermsConditionsModule } from './modules/terms-conditions/terms-conditions.module';
// import { ModulesModule } from './roles/modules/modules.module';
// import { SharedModule } from './shared-module/shared-module.module';
// import { SeederModule } from './seeder/seeder.module';
// import { CategoriesModule } from './modules/categories/categories.module';

// @Module({
//   imports: [
//     ServeStaticModule.forRoot({
//       rootPath: join(__dirname, '..', 'public'),
//       serveRoot: '/public',
//     }),

//     //    ServeStaticModule.forRoot({
//     //   rootPath: join(__dirname, '..', 'public'), // public folder
//     //   serveRoot: '/public', // URL prefix
//     // }),
//     ConfigModule.forRoot({
//       isGlobal: true,
//     }),
//     TypeOrmModule.forRootAsync(typeOrmConfig),
//     AuthModule,
//     UsersModule,
//     CommonModule,
//     BlogModule,
//     ContactModule,
//     TagModule,
//     ProductModule,
//     ReviewModule,
//     CartModule,
//     WebsiteModule,
//     PagesModule,
//     UploadsModule,
//     WebsiteDataModule,
//     SectionModule,
//     RolesModule,
//     PermissionsModule,
//     TermsConditionsModule,
//     ModulesModule,
//     SharedModule,
//     SeederModule,
//     CategoriesModule,

//   ],
//   controllers: [UploadsController],
//   providers: [UploadsService],
//   // providers: [IsUniqueConstraint],
//   // controllers: [UsersController],
//   // providers: [UsersService],
// })
// export class AppModule {}
