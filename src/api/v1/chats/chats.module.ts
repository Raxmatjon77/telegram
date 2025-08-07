import { Module } from '@nestjs/common'
import { ChatsController } from './chats.controller'
import { ChatsService } from './chats.service'
import { ClsModule } from 'nestjs-cls'
import { JwtModule, PrismaModule } from '#services'

@Module({
  providers: [ChatsService],
  imports: [ClsModule, PrismaModule,JwtModule],
  controllers: [ChatsController],
})
export class ChatsModule {}
