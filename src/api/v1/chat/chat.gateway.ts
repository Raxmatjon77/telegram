import { ClsService } from 'nestjs-cls'
import { CreateMessageDto } from './dto'
import { WsAuthMiddleware } from '#common'
import { Socket, Server } from 'socket.io'
import { MessagingService } from './messaging.service'
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets'

@WebSocketGateway({ cors: true })
export class MessagesGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
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

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`)
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`)
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(@MessageBody() dto: CreateMessageDto, @ConnectedSocket() client: Socket) {
    try {
      this.#_cls.set('user', client.data.user)

      const message = await this.#_messaging.sendMessage(dto)
      client.to(dto.chatId).emit('newMessage', message)
      return message
    } catch (error) {
      console.error('Send message error:', error)
      client.emit('error', { message: 'Failed to send message' })
    }
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(@MessageBody('chatId') chatId: string, @ConnectedSocket() client: Socket) {
    try {
      this.#_cls.set('user', client.data.user)

      client.join(chatId)
      return { event: 'joinedChat', chatId }
    } catch (error) {
      console.error('Join chat error:', error)
      client.emit('error', { message: 'Failed to join chat' })
    }
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(
    @MessageBody() data: { chatId: string; limit?: number; cursor?: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.#_cls.set('user', client.data.user)

      return this.#_messaging.getChatMessages(data.chatId, data.limit, data.cursor)
    } catch (error) {
      console.error('Get messages error:', error)
      client.emit('error', { message: 'Failed to retrieve messages' })
    }
  }

  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(@MessageBody('messageId') messageId: string, @ConnectedSocket() client: Socket) {
    try {
      this.#_cls.set('user', client.data.user)

      return this.#_messaging.deleteMessage(messageId)
    } catch (error) {
      console.error('Delete message error:', error)
      client.emit('error', { message: 'Failed to delete message' })
    }
  }
}
