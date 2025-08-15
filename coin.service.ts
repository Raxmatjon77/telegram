import { PrismaService } from '#services'
import { HistoryType } from '@prisma/client'
import { TransferDto, RefundDto, BalanceRes } from './dto'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'

@Injectable()
export class CoinService {
  readonly #_prisma: PrismaService

  constructor(prisma: PrismaService) {
    this.#_prisma = prisma
  }

  async transfer(payload: TransferDto): Promise<void> {
    await this.#_prisma.$transaction(async (tx) => {
      const coin = await tx.coin.findUnique({
        where: {
          userId: payload.userId,
        },
      })

      if (!coin) {
        throw new NotFoundException('User coin not found!')
      }

      if (coin.balance < payload.amount) {
        throw new BadRequestException('Insufficient coin amount')
      }

      await Promise.all([
        tx.coin.update({
          where: {
            id: coin.id,
          },
          data: {
            balance: {
              decrement: payload.amount,
            },
          },
        }),
        tx.history.create({
          data: {
            userId: payload.userId,
            type: HistoryType.TRANSFER,
            additional: JSON.stringify(payload.additional ?? {}),
            amount: payload.amount,
            description: 'payment',
          },
        }),
      ])
    })
  }

  async refund(payload: RefundDto): Promise<void> {
    await this.#_prisma.$transaction(async (tx) => {
      const coin = await tx.coin.findUnique({
        where: {
          userId: payload.userId,
        },
      })

      if (!coin) {
        throw new NotFoundException('User coin not found!')
      }

      await Promise.all([
        tx.coin.update({
          where: {
            id: coin.id,
          },
          data: {
            balance: {
              increment: payload.amount,
            },
          },
        }),
        tx.history.create({
          data: {
            userId: payload.userId,
            type: HistoryType.WITHDRAW,
            additional: JSON.stringify(payload.additional ?? {}),
            amount: payload.amount,
            description: 'refund user coin',
          },
        }),
      ])
    })
  }

  async balance(userId: string): Promise<BalanceRes> {
    const coin = await this.#_prisma.coin.upsert({
      where: { userId },
      create: { userId },
      update: {},
      select: { balance: true },
    })

    return {
      balance: Number(coin.balance),
    }
  }
}