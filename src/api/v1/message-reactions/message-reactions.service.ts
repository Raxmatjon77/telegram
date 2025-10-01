import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '#services'
import { ClsService } from 'nestjs-cls'

@Injectable()
export class MessageReactionsService {
  readonly #_prisma: PrismaService
  readonly #_cls: ClsService

  constructor(prisma: PrismaService, cls: ClsService) {
    this.#_prisma = prisma
    this.#_cls = cls
  }

  async addReaction(messageId: string, emoji: string) {
    const user = this.#_cls.get('user')

    const message = await this.#_prisma.message.findFirst({
      where: {
        id: messageId,
        chat: {
          participants: {
            some: {
              userId: user.id,
              leftAt: null
            }
          }
        }
      }
    })

    if (!message) {
      throw new NotFoundException('Message not found or access denied')
    }

    const allowedEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '🔥', '🎉', '👎', '🤔']
    if (!allowedEmojis.includes(emoji)) {
      throw new BadRequestException('Invalid emoji')
    }

    const reaction = await this.#_prisma.messageReaction.upsert({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId: user.id,
          emoji
        }
      },
      update: {
        createdAt: new Date()
      },
      create: {
        messageId,
        userId: user.id,
        emoji
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    })

    return reaction
  }

  async removeReaction(messageId: string, emoji: string) {
    const user = this.#_cls.get('user')

    const deleted = await this.#_prisma.messageReaction.deleteMany({
      where: {
        messageId,
        userId: user.id,
        emoji
      }
    })

    if (deleted.count === 0) {
      throw new NotFoundException('Reaction not found')
    }

    return { success: true }
  }

  async getMessageReactions(messageId: string) {
    const user = this.#_cls.get('user')

    const hasAccess = await this.#_prisma.message.findFirst({
      where: {
        id: messageId,
        chat: {
          participants: {
            some: {
              userId: user.id,
              leftAt: null
            }
          }
        }
      }
    })

    if (!hasAccess) {
      throw new NotFoundException('Message not found or access denied')
    }

    const reactions = await this.#_prisma.messageReaction.groupBy({
      by: ['emoji'],
      where: {
        messageId
      },
      _count: {
        emoji: true
      },
      orderBy: {
        _count: {
          emoji: 'desc'
        }
      }
    })

    const detailedReactions = await Promise.all(
      reactions.map(async (group) => {
        const users = await this.#_prisma.messageReaction.findMany({
          where: {
            messageId,
            emoji: group.emoji
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        })

        return {
          emoji: group.emoji,
          count: group._count.emoji,
          users: users.map(r => r.user)
        }
      })
    )

    return detailedReactions
  }

  async getUserReactions(messageId: string) {
    const user = this.#_cls.get('user')

    const userReactions = await this.#_prisma.messageReaction.findMany({
      where: {
        messageId,
        userId: user.id
      },
      select: {
        emoji: true,
        createdAt: true
      }
    })

    return userReactions.map(r => r.emoji)
  }
}