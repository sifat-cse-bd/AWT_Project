import {Entity, CreateDateColumn, Column, PrimaryGeneratedColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, } from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Booking } from '../../bookings/entities/booking.entity.js';

@Entity('equipments')
export class Equipment 
{
    
    @PrimaryGeneratedColumn()
    equipId: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column({type: 'int'})
    totalQty: number;

    @Column({type: 'int'})
    availability: number;

  
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;    

    @DeleteDateColumn({ nullable: true })
    deletedAt: Date;

    @ManyToOne(() => User, user => user.equipments, 
    {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
    labAssistant: Relation<User>;

    @ManyToOne(() => Booking, (booking) => booking.equipments, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'bookingId', referencedColumnName: 'bookingId' })
    booking?: Relation<Booking> | null;
}
