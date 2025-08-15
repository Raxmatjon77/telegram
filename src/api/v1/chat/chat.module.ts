import { Module } from '@nestjs/common'
import { MessagesGateway } from './chat.gateway';
import { MessagingService } from './messaging.service';
import { JwtModule, PrismaModule } from '#services';
import { ClsModule } from 'nestjs-cls';
import { WsAuthMiddleware } from '#common';

@Module({
  imports: [PrismaModule, JwtModule, ClsModule],
  providers: [MessagesGateway, MessagingService, WsAuthMiddleware],
})
export class ChatModule {}
