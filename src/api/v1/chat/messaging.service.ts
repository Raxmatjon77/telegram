import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '#services'
import { ClsService } from 'nestjs-cls'
import { CreateMessageDto } from './dto'

@Injectable()
export class MessagingService {
  readonly #_prisma: PrismaService
  readonly #_cls: ClsService
  constructor(prisma: PrismaService, cls: ClsService) {
    this.#_prisma = prisma
    this.#_cls = cls
  }

  async sendMessage(payload: CreateMessageDto):Promise<any> {
    const user = this.#_cls.get('user')

    const participant = await this.#_prisma.chatParticipant.findUnique({
      where: { userId_chatId: { userId: user.id, chatId: payload.chatId } },
    })
    if (!participant) throw new BadRequestException('You are not in this chat')

    const message = await this.#_prisma.message.create({
      data: {
        chatId: payload.chatId,
        senderId: user.id,
        text: payload.text,
        type: payload.type,
        replyToId: payload.replyToId ? payload.replyToId : null,
      },
      include: { sender: true },
    })

    await this.#_prisma.chat.update({
      where: { id: payload.chatId },
      data: { updatedAt: new Date() },
    })

    return message
  }

  async getChatMessages(chatId: string, limit = 50, cursor?: string) {
    const user = this.#_cls.get('user')

    const participant = await this.#_prisma.chatParticipant.findUnique({
      where: { userId_chatId: { userId: user.id, chatId } },
    })
    if (!participant) throw new BadRequestException('You are not in this chat')

    return this.#_prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      include: { sender: true, replyTo: true },
    })
  }

  async deleteMessage(messageId: string) {
    const user = this.#_cls.get('user')

    const message = await this.#_prisma.message.findUnique({ where: { id: messageId } })
    if (!message) throw new NotFoundException('Message not found')
    if (message.senderId !== user.id) throw new BadRequestException('Not your message')

    await this.#_prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date(), text: null, content: null },
    })

    return { success: true }
  }
}
