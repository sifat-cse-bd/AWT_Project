import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Slot } from '../../slots/entities/slot.entity.js';

@Entity('admins')
export class Admin {
  @PrimaryColumn({ type: 'varchar', length: 20 }) adminId: string;

  @Column({ type: 'varchar', length: 100 }) name: string;

  @Column({ unique: true }) email: string;

  @Column() passwordHash: string;

  @OneToMany(() => User, (user) => user.admin)
  users?: Relation<User[]>;

//   @OneToMany(() => AuditLog, (audit) => audit.admin)
//   auditLogs?: Relation<AuditLog[]>;

//   @OneToMany(() => Slot, (slot) => slot.admin)
//   slots?: Relation<Slot[]>;
}
