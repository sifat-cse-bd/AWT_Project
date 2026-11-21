import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from "typeorm";

export enum HazardLevel{
   LOW='LOW', MEDIUM='MEDIUM', HIGH='HIGH', EXTREME='EXTREME'
 }
 
 @Entity('chemicals')
 export class Chemical{

    @PrimaryGeneratedColumn()
    chemId:number;

    @Column({type:'varchar'})
    name:string;

    @Column({type:'text', nullable:true})
    description?:string;

    @Column({type:'enum', enum:HazardLevel, default:HazardLevel.LOW})
    hazardLevel:HazardLevel;

   //  @Column({type:'integer'})
   //  currentQty:number;

   //  @Column({type:'integer'})
   //  minStockQty:number;

   //  @Column({type:'varchar', length:15})
   //  unit:string;

    @Column({type:'date'})
    expiryDate:string;

    @Column({type:'bool',default:true})
    availability:boolean;

    //RELATIONS
    //booking?:Relation<Booking>|null;




    //TIMESTAMPs
    @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
    @UpdateDateColumn({ name: 'updateAt', type: 'timestamptz' }) updateAt: Date;
    @DeleteDateColumn({ name: 'deleteAt', type: 'timestamptz', nullable: true }) deleteAt?: Date;
 }