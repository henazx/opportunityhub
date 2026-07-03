import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto, UpdateBookmarkDto, BookmarkFilterDto } from './dto/bookmark.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('bookmarks')
@Controller('bookmarks')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a bookmark' })
  @ApiResponse({ status: 201, description: 'Bookmark created' })
  async create(@CurrentUser() user: any, @Body() createDto: CreateBookmarkDto) {
    return this.bookmarksService.create(user.id, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookmarks' })
  @ApiResponse({ status: 200, description: 'Bookmarks list' })
  async findAll(@CurrentUser() user: any, @Query() filters: BookmarkFilterDto) {
    return this.bookmarksService.findAll(user.id, filters);
  }

  @Get('folders')
  @ApiOperation({ summary: 'Get bookmarks grouped by folder' })
  async getByFolder(@CurrentUser() user: any) {
    return this.bookmarksService.getByFolder(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bookmark by ID' })
  @ApiResponse({ status: 200, description: 'Bookmark details' })
  async findById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.bookmarksService.findById(user.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update bookmark' })
  @ApiResponse({ status: 200, description: 'Bookmark updated' })
  async update(@CurrentUser() user: any, @Param('id') id: string, @Body() updateDto: UpdateBookmarkDto) {
    return this.bookmarksService.update(user.id, id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove bookmark' })
  @ApiResponse({ status: 200, description: 'Bookmark removed' })
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.bookmarksService.remove(user.id, id);
  }
}
