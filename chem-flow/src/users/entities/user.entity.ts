import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany, RelationId } from 'typeorm';
import type { Relation } from 'typeorm';
import { RegisterableUserRole as UserRole } from '../dto/create-user.dto.js';
export { RegisterableUserRole as UserRole } from '../dto/create-user.dto.js';
import { Admin } from '../../admin/entities/admin.entity.js';
import { Membership } from '../../groups/entities/membership.entity.js';
import { Equipment } from '../../equipments/entities/equipment.entity.js';


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

    //relationship add
    @ManyToOne(() => Admin, (admin) => admin.users, { nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'adminId', referencedColumnName: 'adminId' })
    admin?: Relation<Admin>;

    @RelationId((user: User) => user.admin)
    adminId?: string;

    @OneToMany(() => Membership, (membership) => membership.user)
    memberships?: Relation<Membership[]>;

    @OneToMany(() => Equipment, (equipment) => equipment.labAssistant)
    equipments: Equipment[];
}

