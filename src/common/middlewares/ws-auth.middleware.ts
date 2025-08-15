import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService, PrismaService } from '#services'
import { Socket } from 'socket.io'

@Injectable()
export class WsAuthMiddleware {
  readonly #_jwt: JwtService
  readonly #_prisma: PrismaService

  constructor(jwt: JwtService, prisma: PrismaService) {
    this.#_jwt = jwt
    this.#_prisma = prisma
  }

  async use(socket: Socket, next: (err?: Error) => void) {
    try {
      const token =
        socket.handshake.auth?.token || socket.handshake.headers['authorization']?.toString().replace('Bearer ', '')
        
      if (!token) {
        throw new UnauthorizedException('Missing authentication token')
      }

      const payload = await this.#_jwt.verify(token)
      
      if (!payload) {
        throw new UnauthorizedException('Invalid or expired token')
      }
      
      const user = await this.#_prisma.user.findUnique({
        where: { id: payload.sub },
      })

      if (!user || user.deletedAt) {
        throw new UnauthorizedException('Invalid user or account deactivated')
      }

      socket.data.user = user
      next()
    } catch (err) {
      console.error('WebSocket authentication failed:', err)
      next(new UnauthorizedException('Authentication failed'))
    }
  }
}
