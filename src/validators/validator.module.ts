import { Module } from '@nestjs/common';
import { IsUniqueConstraint } from './is-unique.validator';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([])], // not needed but safe
  providers: [IsUniqueConstraint],
  exports: [IsUniqueConstraint],
})
export class ValidatorModule {}
