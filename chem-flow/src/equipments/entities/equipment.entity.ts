import {Entity, CreateDateColumn, Column, PrimaryGeneratedColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';


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
}