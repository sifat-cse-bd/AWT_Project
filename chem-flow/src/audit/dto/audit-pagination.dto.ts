import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class AuditPaginationDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  // Cap page size to prevent unbounded audit-log queries.
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 20;
}
