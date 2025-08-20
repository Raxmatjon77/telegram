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
    .setTitle('Chat Service API')
    .setDescription('API documentation for the Chat Service - A comprehensive chat application with real-time messaging, file sharing, and user management.')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints for user signup, signin, and token management')
    .addTag('chats', 'Chat management endpoints for creating, searching, and managing chats')
    .addTag('user', 'User profile endpoints for getting and updating user information')
    .addTag('health', 'Health check endpoints for monitoring service status')
    .addTag('messages', 'Real-time messaging endpoints using WebSocket')
    .addTag('reactions', 'Message reactions endpoints for adding and removing reactions')
    .addTag('files', 'File management endpoints for uploading and managing files')
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
