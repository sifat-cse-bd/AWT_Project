import type { RegisterableUserRole } from '../users/dto/create-user.dto.js';

export type AuthRole = RegisterableUserRole | 'ADMIN';

export interface AuthUser {
  userId: string;
  role: AuthRole;
  accountType: 'USER' | 'ADMIN';
}
