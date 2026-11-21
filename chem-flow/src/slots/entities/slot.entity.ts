import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Admin } from '../../admin/entities/admin.entity.js';
import { Booking } from '../../bookings/entities/booking.entity.js';


export enum SlotStatus {
  FREE = 'FREE',
  BOOKED = 'BOOKED',
  CANCELLED = 'CANCELLED',
  POSTPONED = 'POSTPONED',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

@Entity('slots')
export class Slot {
  @PrimaryGeneratedColumn()
  id: number;

  // --- Time & Schedule ---
  @Column({ type: 'time' })
  startingTime: string;

  @Column({ type: 'time' })
  endingTime: string;

  @Column({ nullable: true })
  day?: string;

  @Column({ type: 'date', nullable: true })
  date?: string;

  // --- Capacity & Status ---
  @Column({ type: 'int', default: 0 })
  maxCapacity: number;

  @Column({ type: 'int', default: 0 })
  countCapacity: number;

  @Column({ type: 'enum', enum: SlotStatus, default: SlotStatus.FREE })
  status: SlotStatus;

  // --- Timestamps ---
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  // --- Relations ---
  @ManyToOne(() => Booking, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'bookingId', referencedColumnName: 'bookingId' })
  booking?: Relation<Booking> | null;

  @ManyToOne(() => Admin, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'adminId', referencedColumnName: 'adminId' })
  admin?: Relation<Admin> | null;
}