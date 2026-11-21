import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';


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
}