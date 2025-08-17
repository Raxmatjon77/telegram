import { ulid } from 'zod'
import { ApiModule } from '#api'
import { config } from '#config'
import { AppGuard } from './app.guard'
import { ClsModule } from 'nestjs-cls'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MinioModule, PrismaModule } from '#services'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { LoggerInterceptor, LoggerModule, ZodPipe, ErrorFilter } from '#common'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
      skipProcessEnv: true,
      expandVariables: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 5,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    MinioModule,
    PrismaModule,
    ApiModule,
    LoggerModule,
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: (cls, req) => {
          const reqId = req.headers['x-req-id'] ?? ulid()
          const reqIp = req.headers['x-req-ip'] ?? req.ip ?? 'unknown'
          const device = req.header['x-device-name'] ?? 'unknown'

          cls.set('reqId', reqId as string)
          cls.set('reqIp', reqIp as string)
          cls.set('device', device as string)
        },
      },
    }),
  ],
  providers: [
    { provide: APP_GUARD, useClass: AppGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_PIPE, useClass: ZodPipe },
    { provide: APP_FILTER, useClass: ErrorFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggerInterceptor },
  ],
})
export class AppModule {}
