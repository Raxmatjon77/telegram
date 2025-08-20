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

  /**
   * Add a reaction (emoji) to a message
   *
   * WebSocket event: 'addReaction'
   *
   * @param messageId - The ID of the message to react to
   * @param emoji - The emoji to add as a reaction
   * @returns The created or updated reaction object with user details
   * @throws NotFoundException if message not found or access denied
   * @throws BadRequestException if emoji is invalid
   */
  async addReaction(messageId: string, emoji: string) {
    const user = this.#_cls.get('user')

    // Verify message exists and user has access
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

    // Validate emoji (basic validation for common emojis)
    const allowedEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '🔥', '🎉', '👎', '🤔']
    if (!allowedEmojis.includes(emoji)) {
      throw new BadRequestException('Invalid emoji')
    }

    // Create or update reaction (upsert)
    const reaction = await this.#_prisma.messageReaction.upsert({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId: user.id,
          emoji
        }
      },
      update: {
        createdAt: new Date() // Update timestamp if reaction already exists
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

  /**
   * Remove a reaction (emoji) from a message
   *
   * WebSocket event: 'removeReaction'
   *
   * @param messageId - The ID of the message to remove reaction from
   * @param emoji - The emoji to remove as a reaction
   * @returns Success status of reaction removal
   * @throws NotFoundException if reaction not found
   */
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

  /**
   * Get all reactions for a message
   *
   * WebSocket event: 'getMessageReactions'
   *
   * @param messageId - The ID of the message to get reactions for
   * @returns Array of reaction objects grouped by emoji with user details
   * @throws NotFoundException if message not found or access denied
   */
  async getMessageReactions(messageId: string) {
    const user = this.#_cls.get('user')

    // Verify user has access to the message
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

    // Get reactions grouped by emoji
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

    // Get detailed reactions for each emoji
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

  /**
   * Get all reactions added by the current user to a message
   *
   * WebSocket event: 'getUserReactions'
   *
   * @param messageId - The ID of the message to get user reactions for
   * @returns Array of emojis representing the user's reactions
   */
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