import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    RelationId,
    UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Chemical } from '../../chemicals/entities/chemical.entity.js';
import { Equipment } from '../../equipments/entities/equipment.entity.js';
import { Group } from '../../groups/entities/group.entity.js';
import { Slot } from '../../slots/entities/slot.entity.js';
import { User } from '../../users/entities/user.entity.js';

@Entity('bookings')
export class Booking {
    @PrimaryGeneratedColumn()
    bookingId: number;

    @Column({ type: 'varchar', length: 500 })
    title: string;

    @OneToOne(() => Group, (group) => group.booking, {
        nullable: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'groupName', referencedColumnName: 'name' })
    group: Relation<Group>;

    @RelationId((booking: Booking) => booking.group)
    groupName: string;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
    manager?: Relation<User> | null;

    @RelationId((booking: Booking) => booking.manager)
    userId?: string | null;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @Column({ type: 'timestamptz', nullable: true })
    cancelAt?: Date | null;

    @OneToMany(() => Slot, (slot) => slot.booking)
    slots?: Relation<Slot[]>;

    @OneToMany(() => Equipment, (equipment) => equipment.booking)
    equipments?: Relation<Equipment[]>;

    @OneToMany(() => Chemical, (chemical) => chemical.booking)
    chemicals?: Relation<Chemical[]>;
}
