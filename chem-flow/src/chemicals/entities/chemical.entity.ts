import { Column, Entity, PrimaryColumn } from "typeorm";

export enum HazardLevel{
   LOW='LOW', MEDIUM='MEDIUM', HIGH='HIGH', EXTREME='EXTREME'
 }
 
 @Entity('chemicals')
 export class Chemical{

    @PrimaryColumn({unique:true, type:'integer'})
    id:number;

    @Column({type:'varchar', length:50})
    name:string;

    @Column({type:'enum', enum:HazardLevel})
    hazardLevel:HazardLevel;

    @Column({type:'integer'})
    currentQty:number;

    @Column({type:'integer'})
    minStockQty:number;

    @Column({type:'varchar', length:15})
    unit:string;

    @Column({type:'date'})
    expiryDate:string;
 }