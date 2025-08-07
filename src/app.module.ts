import { ApiModule } from '#api'
import { config } from '#config'
import { AppGuard } from './app.guard'
import { ClsModule } from 'nestjs-cls'
import { Module } from '@nestjs/common'
import { PrismaModule } from '#services'
import { ConfigModule } from '@nestjs/config'
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
    PrismaModule,
    ApiModule,
    LoggerModule,
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),

  ],
  providers: [
    { provide: APP_GUARD, useClass: AppGuard },
    { provide: APP_PIPE, useClass: ZodPipe },
    { provide: APP_FILTER, useClass: ErrorFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggerInterceptor },
  ],
})
export class AppModule {}
