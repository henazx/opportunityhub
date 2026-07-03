import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookmarkFolder } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CreateBookmarkDto {
  @ApiProperty()
  @IsString()
  opportunityId: string;

  @ApiPropertyOptional({ enum: BookmarkFolder })
  @IsOptional()
  @IsEnum(BookmarkFolder)
  folder?: BookmarkFolder;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateBookmarkDto {
  @ApiPropertyOptional({ enum: BookmarkFolder })
  @IsOptional()
  @IsEnum(BookmarkFolder)
  folder?: BookmarkFolder;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class BookmarkFilterDto extends PaginationDto {
  @ApiPropertyOptional({ enum: BookmarkFolder })
  @IsOptional()
  @IsEnum(BookmarkFolder)
  folder?: BookmarkFolder;
}
