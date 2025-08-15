import { Module } from '@nestjs/common'
import { AuthModule } from './auth'
import { UserModule } from './user'
import { ChatsModule } from './chats';
import { ChatModule } from './chat';


@Module({
  imports: [AuthModule, UserModule, ChatsModule, ChatModule],
  providers: [],
})
export class V1Module {}
