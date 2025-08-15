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

        console.log('socket',socket.handshake.headers);
        
        console.log('token :',token);
        
      if (!token) {
        throw new UnauthorizedException('Missing authentication token')
      }

      const payload = await this.#_jwt.verify(token)
      const user = await this.#_prisma.user.findUnique({
        where: { id: payload.sub },
      })

      if (!user) {
        throw new UnauthorizedException('Invalid user')
      }

      socket.data.user = user
      next()
    } catch (err) {
        // throw new UnauthorizedException('Missing authentication token')
      next(new UnauthorizedException('Invalid or expired token'))

    }
  }
}
