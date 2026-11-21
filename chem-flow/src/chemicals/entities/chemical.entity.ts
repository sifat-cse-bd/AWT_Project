import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import type { Relation } from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity.js';
import { HazardLevel } from "../dtos/create-chemical.dto.js";

 
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

    @ManyToOne(() => Booking, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'bookingId', referencedColumnName: 'bookingId' })
    booking?: Relation<Booking> | null;
 }