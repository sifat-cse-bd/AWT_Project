import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('storage')
export class Storage{

    @PrimaryGeneratedColumn()
    storeId:number;

    @Column({type:'varchar'})
    section:string;

    @Column({type:'varchar'})
    shelf:string;
}