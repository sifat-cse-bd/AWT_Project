import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto.js';

export class UpdateUserAdminDto extends PartialType(CreateUserDto) {}