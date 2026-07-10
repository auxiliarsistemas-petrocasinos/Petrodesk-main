import { LoanStatus } from '@prisma/client';
import { IsBooleanString, IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLoanDto { @IsUUID() assetId!: string; @IsOptional() @IsUUID() userId?: string; @IsDateString() expectedReturnDate!: string; @IsString() @MinLength(1) @MaxLength(2000) notes!: string; }
export class UpdateLoanDto { @IsOptional() @IsUUID() userId?: string; @IsOptional() @IsDateString() expectedReturnDate?: string; @IsOptional() @IsString() @MaxLength(2000) notes?: string; }
export class LoanNotesDto { @IsString() @MinLength(1) @MaxLength(2000) notes!: string; }
export class ReturnLoanDto extends LoanNotesDto { @IsString() @MinLength(1) @MaxLength(100) condition!: string; }
export class LoanHistoryDto { @IsString() @MinLength(1) @MaxLength(100) action!: string; @IsOptional() @IsString() @MaxLength(2000) notes?: string; }
export class LoanQueryDto {
  @IsOptional() @IsEnum(LoanStatus) status?: LoanStatus;
  @IsOptional() @IsUUID() userId?: string;
  @IsOptional() @IsUUID() assetId?: string;
  @IsOptional() @IsBooleanString() overdue?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number;
}
