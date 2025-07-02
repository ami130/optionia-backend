import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { IsUniqueConstraint } from 'src/validators/is-unique.validator';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, IsUniqueConstraint],
  controllers: [UsersController],
  exports: [UsersService, IsUniqueConstraint], // Export if you need it elsewhere
})
export class UsersModule {}
