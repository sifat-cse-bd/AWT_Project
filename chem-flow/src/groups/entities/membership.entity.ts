import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId, Unique } from 'typeorm';
import type { Relation } from 'typeorm';
import { Group } from './group.entity.js';
import { User } from '../../users/entities/user.entity.js';

@Entity('memberships')
@Unique(['group', 'user'])
export class Membership {
  @PrimaryGeneratedColumn() 
  membershipId: number;

  @ManyToOne(() => Group, (group) => group.memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId', referencedColumnName: 'groupId' })
  group: Relation<Group>;

  @RelationId((membership: Membership) => membership.group)
  groupId: string;

  @ManyToOne(() => User, (user) => user.memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
  user: Relation<User>;

  @RelationId((membership: Membership) => membership.user)
  userId: string;
}
