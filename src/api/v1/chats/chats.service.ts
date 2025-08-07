import { PrismaService } from '#services'
import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateDto } from './dto'
import { ClsService } from 'nestjs-cls'
import { Chat } from '@prisma/client'

@Injectable()
export class ChatsService {
  readonly #_prisma: PrismaService
  readonly #_cls: ClsService

  constructor(prisma: PrismaService, cls: ClsService) {
    this.#_prisma = prisma
    this.#_cls = cls
  }

  async create(dto: CreateDto): Promise<void> {
    const user = this.#_cls.get('user')

    const existingChat = await this.#_prisma.chat.findUnique({
      where: {
        title_type: {
          title: dto.title,
          type: dto.type,
        },
      },
    })

    if (existingChat) {
      throw new BadRequestException('Chat with this title and type already exists')
    }

    await this.#_prisma.chat.create({
      data: {
        title: dto.title,
        type: dto.type,
        participants: {
          create: {
            userId: user.id,
          },
        },
        ownerId: user.id,
      },
    })
  }

  async getChats(): Promise<Chat[]> {
    const user = this.#_cls.get('user')
    return this.#_prisma.chat.findMany({
      where: {
        participants: { some: { userId: user.id } },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        participants: true,
      },
    })
  }

  async search(query: string): Promise<Chat[]> {
    const user = this.#_cls.get('user')

    return this.#_prisma.chat.findMany({
      where: {
        title: {
          contains: query,
          mode: 'insensitive',
        },
        participants: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })
  }

  async searchByUser(query: string): Promise<Chat[]> {
    const user = this.#_cls.get('user')
    return this.#_prisma.chat.findMany({
      where: {
        participants: {
          some: {
            user: {
              OR: [
                { username: { contains: query, mode: 'insensitive' } },
                { firstName: { contains: query, mode: 'insensitive' } },
                { lastName: { contains: query, mode: 'insensitive' } },
              ],
            },
          },
        },
      },
      include: {
        participants: {
          where: {
            userId: user.id,
          },
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })
  }

  async getPinnedChats(): Promise<Chat[]> {
    const user = this.#_cls.get('user')
    return this.#_prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId: user.id,
            isPinned: true,
          },
        },
      },
      include: {
        participants: {
          where: {
            userId: user.id,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })
  }

  async createDirectChat(targetUserId: string): Promise<Chat> {
    const user = this.#_cls.get('user')

    const existing = await this.#_prisma.chat.findFirst({
      where: {
        type: 'private',
        participants: {
          every: {
            userId: { in: [user.id, targetUserId] },
          },
        },
      },
      include: {
        participants: true,
      },
    })

    if (existing) return existing

    return this.#_prisma.chat.create({
      data: {
        type: 'private',
        participants: {
          createMany: {
            data: [{ userId: user.id }, { userId: targetUserId }],
          },
        },
      },
      include: {
        participants: true,
      },
    })
  }

  async leaveChat(chatId: string): Promise<void> {
    const user = this.#_cls.get('user')

    const participant = await this.#_prisma.chatParticipant.findUnique({
      where: {
        userId_chatId: {
          userId: user.id,
          chatId,
        },
        leftAt: null,
      },
    })

    if (!participant) {
      throw new BadRequestException('You are not a participant of this chat')
    }

    await this.#_prisma.chatParticipant.update({
      where: {
        id: participant.id,
      },
      data: {
        leftAt: new Date(),
      },
    })
  }

  
}
