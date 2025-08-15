import { PrismaService } from '#services'
import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateDto } from './dto'
import { ClsService } from 'nestjs-cls'
import { Chat } from '@prisma/client'
import { log } from 'console'
import { string } from 'zod'

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

  async search(query: string): Promise<any> {
    const user = this.#_cls.get('user')

    let userChats = []

    log('Searching for chats with query:', query)

    userChats = await this.#_prisma.chat.findMany({
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
    if (userChats.length > 0) {
      return userChats
    } else {
      const user = await this.#_prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      if (user.length === 0) {
        return []
      } else {
        return {
          id: 'string',
          participants: [
            {
              user: {
                id: user[0].id,
                username: user[0].username,
                firstName: user[0].firstName,
                lastName: user[0].lastName,
                avatar: user[0].avatar,
                email: user[0].email,
                createdAt: user[0].createdAt,
                updatedAt: user[0].updatedAt,
              },
            },
          ],
          title: user[0].username,
          type: 'private',
          createdAt: new Date(),
          updatedAt: new Date(),
          ownerId: user[0].id,
          isPinned: false,
          isRead: false,
          deletedAt: null,
          lastMessage: null,
          lastMessageAt: null,
          unreadCount: 0,
          isArchived: false,
        }
      }
    }
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

  async markAsRead(chatId: string) {
    const user = this.#_cls.get('user')

    await this.#_prisma.chatParticipant.update({
      where: {
        userId_chatId: { userId: user.id, chatId },
      },
      data: {
        isRead: true,
      },
    })
  }

  async markAllAsRead(chatId: string) {
    const user = this.#_cls.get('user')

    await this.#_prisma.chatParticipant.update({
      where: {
        userId_chatId: { userId: user.id, chatId },
      },
      data: {
        isRead: true,
      },
    })
  }

  async pinChat(chatId: string, isPinned: boolean): Promise<void> {
    const user = this.#_cls.get('user')

    await this.#_prisma.chatParticipant.update({
      where: {
        userId_chatId: { userId: user.id, chatId },
      },
      data: {
        isPinned,
      },
    })
  }
}
