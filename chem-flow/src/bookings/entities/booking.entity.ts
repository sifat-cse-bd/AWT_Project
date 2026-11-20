import {Column,CreateDateColumn,Entity,JoinColumn,
    ManyToOne,PrimaryGeneratedColumn,UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

//used to define the possible status of bookings
export enum BookingStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED',
}

@Entity('bookings')
export class Booking {
    @PrimaryGeneratedColumn()
    id: number;

    //many to one relationship with the user entity
    @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'requester_id' }) //join user id as a booking id
    requester: User;

    @Column({ type: 'timestamptz' }) 
    startAt: Date;

    @Column({ type: 'timestamptz' })
    endAt: Date;

    @Column({ type: 'varchar', length: 500 })
    purpose: string;

    @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
    status: BookingStatus;

    @CreateDateColumn() 
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
