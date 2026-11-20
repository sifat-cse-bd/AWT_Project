import { PartialType } from "@nestjs/swagger";
import { CreateChemicalDto } from "./create-chemical.dto.js";

export class UpdateChemicalDto extends PartialType(CreateChemicalDto){}