import {Entity, CreateDateColumn, Column, PrimaryGeneratedColumn, 
    UpdateDateColumn, DeleteDateColumn,
     ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Booking } from '../../bookings/entities/booking.entity.js';
import { Storage } from '../../storage/entities/storage.entity.js';


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

    @ManyToMany(() => Storage, storage => storage.equipments)
    @JoinTable
    ({
        name: 'equipmentStorage',
        joinColumn: {
            name: 'equipId',
            referencedColumnName: 'equipId'
        },
        inverseJoinColumn: {
            name: 'storeId',
            referencedColumnName: 'storeId'
        }
    })
    storages: Relation<Storage[]>;
}
