import { CreateGroupDto } from "./create-goup.dto.js";
import { PartialType } from '@nestjs/mapped-types'

export class UpdateGroupDto extends PartialType(CreateGroupDto) {}