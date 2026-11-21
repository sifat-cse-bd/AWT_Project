
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, RelationId, UpdateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Membership } from './membership.entity.js';
import { Booking } from '../../bookings/entities/booking.entity.js';

@Entity('groups')
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

    @OneToOne(() => Booking, (booking) => booking.group)
    booking?: Relation<Booking>;

    @CreateDateColumn() 
    createdAt: Date;

    @UpdateDateColumn() 
    updatedAt: Date;

    @DeleteDateColumn({ nullable: true }) 
    deletedAt?: Date;
}
