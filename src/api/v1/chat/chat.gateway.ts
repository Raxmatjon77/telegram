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

  /**
   * Send a message to a chat
   *
   * Emits:
   * - 'newMessage' to all participants in the chat with the message details
   * - 'error' if there's an issue sending the message
   *
   * @param dto - CreateMessageDto containing chatId, text, type, and replyToId
   * @param client - Connected socket client
   * @returns The created message object
   */
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

  /**
   * Join a chat room
   *
   * Emits:
   * - 'joinedChat' with the chatId when successfully joined
   * - 'error' if there's an issue joining the chat
   *
   * @param chatId - The ID of the chat to join
   * @param client - Connected socket client
   * @returns Object with event name and chatId
   */
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

  /**
   * Get messages for a chat
   *
   * Emits:
   * - Returns an array of messages for the specified chat
   * - 'error' if there's an issue retrieving messages
   *
   * @param data - Object containing chatId, limit (optional), and cursor (optional)
   * @param client - Connected socket client
   * @returns Array of message objects
   */
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

  /**
   * Delete a message
   *
   * Emits:
   * - Returns success status of message deletion
   * - 'error' if there's an issue deleting the message
   *
   * @param messageId - The ID of the message to delete
   * @param client - Connected socket client
   * @returns Success status of message deletion
   */
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
