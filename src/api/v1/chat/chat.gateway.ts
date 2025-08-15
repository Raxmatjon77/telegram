import { ClsService } from 'nestjs-cls'
import { CreateMessageDto } from './dto'
import { WsAuthMiddleware } from '#common'
import { Socket, Server } from 'socket.io'
import { MessagingService } from './messaging.service'
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayInit } from '@nestjs/websockets'

@WebSocketGateway({ cors: true })
export class MessagesGateway implements OnGatewayInit {
  readonly #_messaging: MessagingService
  readonly #_auth: WsAuthMiddleware
  readonly #_cls: ClsService

  constructor(messaging: MessagingService, auth: WsAuthMiddleware, cls: ClsService) {
    this.#_messaging = messaging
    this.#_auth = auth
    this.#_cls = cls
  }

  afterInit(server: Server) {
    server.use(async (socket, next) => {
      await this.#_auth.use(socket, next)
    })
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(@MessageBody() dto: CreateMessageDto, @ConnectedSocket() client: Socket) {
    this.#_cls.set('user', client.data.user)
    console.log('dto', dto)
    

    const message = await this.#_messaging.sendMessage(dto)
    client.to(dto.chatId).emit('newMessage', message)
    return message
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(@MessageBody('chatId') chatId: string, @ConnectedSocket() client: Socket) {
    this.#_cls.set('user', client.data.user)

    client.join(chatId)
    return { event: 'joinedChat', chatId }
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(
    @MessageBody() data: { chatId: string; limit?: number; cursor?: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.#_cls.set('user', client.data.user)

    return this.#_messaging.getChatMessages(data.chatId, data.limit, data.cursor)
  }

  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(@MessageBody('messageId') messageId: string, @ConnectedSocket() client: Socket) {
    this.#_cls.set('user', client.data.user)

    return this.#_messaging.deleteMessage(messageId)
  }
}
