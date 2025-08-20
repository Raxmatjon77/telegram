import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { ChatsService } from './chats.service'
import { CreateDto } from './dto'
import { ProfileGuard } from '#common'
import { Chat } from '@prisma/client'
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger'

@Controller({
  path: 'chats',
  version: '1',
})
@ApiTags('chats')
@UseGuards(ProfileGuard)
export class ChatsController {
  readonly #_service: ChatsService

  constructor(service: ChatsService) {
    this.#_service = service
  }

  @Post()
  @ApiOperation({ summary: 'Create a new chat', description: 'Create a new chat with the provided details' })
  @ApiResponse({ status: 201, description: 'Chat successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing authentication' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateDto })
  create(@Body() dto: CreateDto): Promise<void> {
    return this.#_service.create(dto)
  }

  @Get()
  @ApiOperation({ summary: 'Get all chats', description: 'Retrieve all chats for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved chats' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing authentication' })
  @ApiBearerAuth()
  getChats(): Promise<Chat[]> {
    return this.#_service.getChats()
  }

  @Get('search')
  @ApiOperation({ summary: 'Search chats', description: 'Search for chats by query string' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved search results' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing authentication' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'query', description: 'Search query string', required: true })
  searchChats(@Query('query') query: string): Promise<Chat[]> {
    return this.#_service.search(query)
  }

  @Get('search/users')
  @ApiOperation({ summary: 'Search chats by user', description: 'Search for chats by user query string' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved search results' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing authentication' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'query', description: 'User search query string', required: true })
  searchByUser(@Query('query') query: string): Promise<Chat[]> {
    return this.#_service.searchByUser(query)
  }

  @Get('pinned')
  @ApiOperation({ summary: 'Get pinned chats', description: 'Retrieve all pinned chats for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved pinned chats' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing authentication' })
  @ApiBearerAuth()
  getPinnedChats(): Promise<Chat[]> {
    return this.#_service.getPinnedChats()
  }

  @Post('direct/:targetUserId')
  @ApiOperation({ summary: 'Create direct chat', description: 'Create a direct chat with another user' })
  @ApiResponse({ status: 201, description: 'Direct chat successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing authentication' })
  @ApiBearerAuth()
  @ApiParam({ name: 'targetUserId', description: 'Target user ID for direct chat', required: true })
  createDirectChat(@Param('targetUserId') targetUserId: string): Promise<Chat> {
    return this.#_service.createDirectChat(targetUserId)
  }

  @Delete(':chatId/leave')
  @ApiOperation({ summary: 'Leave chat', description: 'Leave a chat by chat ID' })
  @ApiResponse({ status: 200, description: 'Successfully left the chat' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing authentication' })
  @ApiBearerAuth()
  @ApiParam({ name: 'chatId', description: 'Chat ID to leave', required: true })
  leaveChat(@Param('chatId') chatId: string): Promise<void> {
    return this.#_service.leaveChat(chatId)
  }

  @Patch(':chatId/read')
  @ApiOperation({ summary: 'Mark chat as read', description: 'Mark a chat as read by chat ID' })
  @ApiResponse({ status: 200, description: 'Chat successfully marked as read' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing authentication' })
  @ApiBearerAuth()
  @ApiParam({ name: 'chatId', description: 'Chat ID to mark as read', required: true })
  markAsRead(@Param('chatId') chatId: string): Promise<void> {
    return this.#_service.markAsRead(chatId)
  }

  @Patch(':chatId/read-all')
  @ApiOperation({ summary: 'Mark all messages as read', description: 'Mark all messages in a chat as read by chat ID' })
  @ApiResponse({ status: 200, description: 'All messages successfully marked as read' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing authentication' })
  @ApiBearerAuth()
  @ApiParam({ name: 'chatId', description: 'Chat ID to mark all messages as read', required: true })
  markAllAsRead(@Param('chatId') chatId: string): Promise<void> {
    return this.#_service.markAllAsRead(chatId)
  }

  @Patch(':chatId/pin')
  @ApiOperation({ summary: 'Pin/unpin chat', description: 'Pin or unpin a chat by chat ID' })
  @ApiResponse({ status: 200, description: 'Chat successfully pinned/unpinned' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing authentication' })
  @ApiBearerAuth()
  @ApiParam({ name: 'chatId', description: 'Chat ID to pin/unpin', required: true })
  @ApiBody({ description: 'Pin status', examples: { isPinned: { value: { isPinned: true } } } })
  pinChat(@Param('chatId') chatId: string, @Body() body: { isPinned: boolean }): Promise<void> {
    return this.#_service.pinChat(chatId, body.isPinned)
  }
}
