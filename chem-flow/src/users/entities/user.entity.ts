import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

export enum UserRole {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    TECHNICIAN = 'TECHNICIAN',
    STUDENT = 'STUDENT',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    userId: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    passwordHash: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
    role: UserRole;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt: Date;
}