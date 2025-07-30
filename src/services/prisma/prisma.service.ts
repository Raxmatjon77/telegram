import { Config } from '#config'
import { PrismaClient } from '@prisma/client'
import { ConfigService } from '@nestjs/config'
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(config: ConfigService) {
    super({
      datasourceUrl: config.getOrThrow<Config['database']['url']>('database.url'),
    })
  }

  async onModuleInit(): Promise<void> {
    await this.$connect()
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect()
  }
}
