import { Injectable } from '@nestjs/common'
import { PrismaService } from '#services'

@Injectable()
export class TransactionService {
  readonly #_prisma: PrismaService

  constructor(prisma: PrismaService) {
    this.#_prisma = prisma
  }

  async check(payload: any) {
    return {
      message: 'Transaction checked',
      payload,
    }
  }

  async prepay(payload: any) {
    return {
      message: 'otp code sent !',
      payload,
    }
  }

  async pay(payload: any) {
    return {
      message: 'payment accepted !',
      payload,
    }
  }
}
