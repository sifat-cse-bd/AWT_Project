import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Storage } from '../../storage/entities/storage.entity.js';
import { Booking } from '../../bookings/entities/booking.entity.js';

export enum HazardLevel {
   LOW = 'LOW', MEDIUM = 'MEDIUM', HIGH = 'HIGH', EXTREME = 'EXTREME'
}

@Entity('chemicals')
export class Chemical {

   @PrimaryGeneratedColumn()
   chemId: number;

   @Column({ type: 'varchar' })
   name: string;

   @Column({ type: 'text', nullable: true })
   description: string | null;

   @Column({ type: 'enum', enum: HazardLevel, default: HazardLevel.LOW })
   hazardLevel: HazardLevel;

   @Column({ type: 'date' })//"YYYY-MM-DD"
   expiryDate: string;

   @Column({ type: 'bool', default: true })
   availability: boolean;

   @ManyToOne(() => Storage, p => p.chemicals)
   @JoinColumn({ name: 'storeId' })
   storage: Relation<Storage>;

   @ManyToOne(() => Booking, (booking) => booking.chemicals, {nullable: true, onDelete: 'SET NULL'
   })
   @JoinColumn({ name: 'bookingId' })
   booking?: Relation<Booking> | null;

   //TIMESTAMPs
   @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
   @UpdateDateColumn({ name: 'updateAt', type: 'timestamptz' }) updateAt: Date;
   @DeleteDateColumn({ name: 'deleteAt', type: 'timestamptz', nullable: true }) deleteAt?: Date;
}
