import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { ChatsService } from './chats.service'
import { CreateDto } from './dto'
import { ProfileGuard } from '#common'
import { Chat } from '@prisma/client'

@Controller({
  path: 'chats',
  version: '1',
})
@UseGuards(ProfileGuard)
export class ChatsController {
  readonly #_service: ChatsService

  constructor(service: ChatsService) {
    this.#_service = service
  }

  @Post()
  create(@Body() dto: CreateDto): Promise<void> {
    return this.#_service.create(dto)
  }

  @Get()
  getChats(): Promise<Chat[]> {
    return this.#_service.getChats()
  }

  @Get('search')
  searchChats(@Query('query') query: string): Promise<Chat[]> {
    return this.#_service.search(query)
  }

  @Get('search/users')
  searchByUser(@Query('query') query: string): Promise<Chat[]> {
    return this.#_service.searchByUser(query)
  }

  @Get('pinned')
  getPinnedChats(): Promise<Chat[]> {
    return this.#_service.getPinnedChats()
  }

  @Post('direct/:targetUserId')
  createDirectChat(@Param('targetUserId') targetUserId: string): Promise<Chat> {
    return this.#_service.createDirectChat(targetUserId)
  }

  @Delete(':chatId/leave')
  leaveChat(@Param('chatId') chatId: string): Promise<void> {
    return this.#_service.leaveChat(chatId)
  }

  @Patch(':chatId/read')
  markAsRead(@Param('chatId') chatId: string): Promise<void> {
    return this.#_service.markAsRead(chatId)
  }

  @Patch(':chatId/read-all')
  markAllAsRead(@Param('chatId') chatId: string): Promise<void> {
    return this.#_service.markAllAsRead(chatId)
  }

  @Patch(':chatId/pin')
  pinChat(@Param('chatId') chatId: string, @Body() body: { isPinned: boolean }): Promise<void> {
    return this.#_service.pinChat(chatId, body.isPinned)
  }
}
