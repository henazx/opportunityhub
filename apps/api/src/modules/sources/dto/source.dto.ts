import { IsString, IsOptional, IsUrl, IsEnum, IsObject, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SourceStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CreateSourceDto {
  @ApiProperty({ example: 'Indeed Jobs' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'https://indeed.com' })
  @IsUrl()
  url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'web-scraper' })
  @IsString()
  collectorType: string;

  @ApiPropertyOptional({ example: 'daily' })
  @IsOptional()
  @IsString()
  frequency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}

export class UpdateSourceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  collectorType?: string;

  @ApiPropertyOptional({ enum: SourceStatus })
  @IsOptional()
  @IsEnum(SourceStatus)
  status?: SourceStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  frequency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}

export class SourceFilterDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: SourceStatus })
  @IsOptional()
  @IsEnum(SourceStatus)
  status?: SourceStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  collectorType?: string;
}
