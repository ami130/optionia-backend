// import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
// import { Role } from '../role.entity/role.entity';

// @Entity('permissions')
// export class Permission {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({ unique: true })
//   name: string;

//   @Column()
//   module: string;

//   @Column({ nullable: true })
//   description?: string;

//   @ManyToMany(() => Role, (role) => role.permissions)
//   roles: Role[];
// }
