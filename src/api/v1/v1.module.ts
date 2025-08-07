import { Module } from '@nestjs/common'
import { AuthModule } from './auth'
import { UserModule } from './user'
import { ChatsModule } from './chats';

@Module({
  imports: [AuthModule,UserModule, ChatsModule],
})
export class V1Module {}
