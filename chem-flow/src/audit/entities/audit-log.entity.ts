import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Column({ type: 'varchar', length: 50 })
  performedBy: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  targetId: string;

  @Column({ type: 'jsonb', nullable: true })
  // Keep JSON metadata object-shaped and type-safe in application code.
  details: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  updatedAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  cancelAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  approvedAt?: Date;
}