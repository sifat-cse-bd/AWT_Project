import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Chemical } from "../../chemicals/entities/chemical.entity.js";

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
}
