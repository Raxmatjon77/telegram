import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
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
}
