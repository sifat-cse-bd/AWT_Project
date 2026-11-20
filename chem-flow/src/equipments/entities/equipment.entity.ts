import {Entity, CreateDateColumn, Column, PrimaryGeneratedColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

export enum EquipmentStatus {
    Ok = 'Ok',
    Broken = 'Broken',
    Repairing = 'Repairing',
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

    @Column({ type: 'enum', enum: EquipmentStatus, default: EquipmentStatus.Ok })
    status: EquipmentStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;    

    @DeleteDateColumn({ nullable: true })
    deletedAt: Date;
}