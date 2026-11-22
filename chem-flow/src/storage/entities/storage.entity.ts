import { Column, Entity, OneToMany, PrimaryGeneratedColumn, ManyToMany, ManyToOne, JoinColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Chemical } from "../../chemicals/entities/chemical.entity.js";
import { User } from '../../users/entities/user.entity.js';
import { Equipment } from "../../equipments/entities/equipment.entity.js";


@Entity('storage')
export class Storage{

    @PrimaryGeneratedColumn()
    storeId:number;

    @Column({type:'varchar', unique:true})
    section:string;

    @Column({type:'varchar'})
    shelf:string;

    @OneToMany(()=>Chemical,p=>p.storage)
    chemicals:Relation<Chemical[]>;

    @ManyToMany(() => Equipment, equipment => equipment.storages)
    equipments: Relation<Equipment[]>;

    @ManyToOne(() => User, user => user.storages, {
    nullable: false,
    onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
    labAssistant: Relation<User>;
}
