import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name)
  readonly #_prisma: PrismaService

  constructor(prisma: PrismaService) {
    this.#_prisma = prisma
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupExpiredTokens() {
    try {
      this.logger.log('Starting cleanup of expired refresh tokens...')

      const result = await this.#_prisma.refreshToken.updateMany({
        where: {
          expiresAt: {
            lt: new Date()
          },
          isRevoked: false
        },
        data: {
          isRevoked: true,
          revokedAt: new Date()
        }
      })

      this.logger.log(`Cleaned up ${result.count} expired refresh tokens`)
    } catch (error) {
      this.logger.error('Failed to cleanup expired tokens:', error.message)
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupInactiveSessions() {
    try {
      this.logger.log('Starting cleanup of inactive sessions...')

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const result = await this.#_prisma.session.updateMany({
        where: {
          lastSeen: {
            lt: thirtyDaysAgo
          },
          isActive: true,
          deletedAt: null
        },
        data: {
          isActive: false,
          deletedAt: new Date()
        }
      })

      this.logger.log(`Cleaned up ${result.count} inactive sessions`)
    } catch (error) {
      this.logger.error('Failed to cleanup inactive sessions:', error.message)
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async cleanupOldRevokedTokens() {
    try {
      this.logger.log('Starting cleanup of old revoked tokens...')

      const sixtyDaysAgo = new Date()
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

      const result = await this.#_prisma.refreshToken.deleteMany({
        where: {
          isRevoked: true,
          revokedAt: {
            lt: sixtyDaysAgo
          }
        }
      })

      this.logger.log(`Permanently deleted ${result.count} old revoked tokens`)
    } catch (error) {
      this.logger.error('Failed to cleanup old revoked tokens:', error.message)
    }
  }

  async getTokenStatistics() {
    try {
      const [activeTokens, expiredTokens, revokedTokens, totalSessions] = await Promise.all([
        this.#_prisma.refreshToken.count({
          where: {
            isRevoked: false,
            expiresAt: {
              gt: new Date()
            }
          }
        }),
        this.#_prisma.refreshToken.count({
          where: {
            isRevoked: false,
            expiresAt: {
              lt: new Date()
            }
          }
        }),
        this.#_prisma.refreshToken.count({
          where: {
            isRevoked: true
          }
        }),
        this.#_prisma.session.count({
          where: {
            isActive: true,
            deletedAt: null
          }
        })
      ])

      return {
        activeTokens,
        expiredTokens,
        revokedTokens,
        totalSessions,
        totalTokens: activeTokens + expiredTokens + revokedTokens
      }
    } catch (error) {
      this.logger.error('Failed to get token statistics:', error.message)
      throw error
    }
  }
}