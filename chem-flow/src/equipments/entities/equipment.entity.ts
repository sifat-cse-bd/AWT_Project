import {Entity, CreateDateColumn, Column, PrimaryGeneratedColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

export enum EquipmentStatus {
    OK = 'OK',
    BROKEN = 'BROKEN',
    REPAIRING = 'REPAIRING',
}

@Entity('equipments')
export class Equipment 
{
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({type: 'int'})
    totalQty: number;

    @Column({type: 'int'})
    availableQty: number;

    @Column({ type: 'enum', enum: EquipmentStatus, default: EquipmentStatus.OK })
    status: EquipmentStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;    

    @DeleteDateColumn({ nullable: true })
    deletedAt: Date;
}