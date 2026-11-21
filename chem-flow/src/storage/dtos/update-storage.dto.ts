import { PartialType } from "@nestjs/swagger";
import { CreateStorageDto } from "./create-storage.dto.js";

export class UpdateStorageDto extends PartialType(CreateStorageDto){}