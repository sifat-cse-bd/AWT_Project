import {Entity, CreateDateColumn, Column, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';
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

    @ManyToOne(() => Booking, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'bookingId', referencedColumnName: 'bookingId' })
    booking?: Relation<Booking> | null;
}