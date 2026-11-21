
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, RelationId, UpdateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Membership } from './membership.entity.js';

@Entity('Group')
export class Group {
    @PrimaryColumn({ type: 'varchar', length: 60 }) 
    groupId: string;

    @Column({ unique: true }) 
    name: string;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'createdBy', referencedColumnName: 'userId' })
    createdBy?: Relation<User> | null;

    @RelationId((group: Group) => group.createdBy)
    createdByUserId?: string;

    @OneToMany(() => Membership, (membership) => membership.group)
    memberships?: Relation<Membership[]>;

    @CreateDateColumn() 
    createdAt: Date;

    @UpdateDateColumn() 
    updatedAt: Date;

    @DeleteDateColumn({ nullable: true }) 
    deletedAt?: Date;
}
