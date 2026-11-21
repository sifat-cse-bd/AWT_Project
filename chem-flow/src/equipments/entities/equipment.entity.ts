import {Entity, CreateDateColumn, Column, PrimaryGeneratedColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, } from 'typeorm';

import {User} from '../../users/entities/user.entity.js';

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
    labAssistant: User;
}