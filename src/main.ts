import { LoggerService } from '#common'
import { AppModule } from './app.module'
import { NestFactory } from '@nestjs/core'
import { VersioningType } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { NestExpressApplication } from '@nestjs/platform-express'
import { User } from '#common'

declare module 'nestjs-cls' {
  interface ClsStore {
    user: User
    reqId: string
    reqIp: string
    device: string
    userAgent: string
    deviceId: string
  }
}

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
    bufferLogs: true,
  })

  const logger = await app.resolve(LoggerService)

  app.set('env', 'production')
  app.set('etag', 'strong')
  app.set('trust proxy', true)
  app.set('x-powered-by', false)

  app.useLogger(logger)
  app.setGlobalPrefix('api')
  app.enableVersioning({ type: VersioningType.URI })

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Chat Service')
    .setVersion('1.0.0')
    .setDescription('Rest API Documentation')
    .addBearerAuth()
    .build()

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig)

  SwaggerModule.setup('/docs', app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
      defaultModelsExpandDepth: -1,
    },
  })

  await app.listen(4001, '0.0.0.0')
}

bootstrap()
