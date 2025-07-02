/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// /* eslint-disable @typescript-eslint/no-wrapper-object-types */
// // src/validators/is-unique.validator.ts
// import {
//   registerDecorator,
//   ValidationOptions,
//   ValidatorConstraint,
//   ValidatorConstraintInterface,
//   ValidationArguments,
// } from 'class-validator';
// import { Injectable } from '@nestjs/common';
// import { UsersService } from 'src/users/users.service';

// @ValidatorConstraint({ name: 'IsUnique', async: true })
// @Injectable()
// export class IsUniqueConstraint implements ValidatorConstraintInterface {
//   constructor(private readonly userService: UsersService) {} // Inject the service

//   async validate(value: any, args: ValidationArguments): Promise<boolean> {
//     console.log('UserService:', this.userService);
//     const [property] = args.constraints;
//     const exists = await this.userService.findByProperty(property, value); // Use the service method
//     return !exists;
//   }

//   defaultMessage(args: ValidationArguments): string {
//     return `${args.property} already exists`;
//   }
// }

// export function IsUnique(property: string, validationOptions?: ValidationOptions) {
//   return function (object: Object, propertyName: string) {
//     registerDecorator({
//       target: object.constructor,
//       propertyName: propertyName,
//       options: validationOptions,
//       constraints: [property],
//       validator: IsUniqueConstraint,
//     });
//   };
// }

/* eslint-disable @typescript-eslint/no-wrapper-object-types */
// src/validators/is-unique.validator.ts

import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Inject, forwardRef } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

export function IsUnique(entity: Function, field: string, validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [entity, field],
      validator: IsUniqueConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'IsUnique', async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(
    @Inject(forwardRef(() => getRepositoryToken(User))) // Simplified example
    private repository: any,
  ) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const [entity, field] = args.constraints;
    const repository = this.repository; // In real implementation, get dynamically

    const exists = await repository.findOne({
      where: { [field]: value },
    });

    return !exists;
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} '${args.value}' is already taken`;
  }
}
