import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto.js';

export class UpdateUserSelfDto extends PartialType(
  PickType(CreateUserDto, ['name', 'email', 'password'] as const),
) {}