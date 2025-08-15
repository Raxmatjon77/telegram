import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common'
import { Request } from 'express'
import { ClsService } from 'nestjs-cls'
import { JwtService, PrismaService } from '#services'

@Injectable()
export class ProfileGuard implements CanActivate {
  readonly #_cls: ClsService
  readonly #_jwt: JwtService
  readonly #_prisma: PrismaService

  constructor(cls: ClsService, jwt: JwtService, prisma: PrismaService) {
    this.#_cls = cls
    this.#_jwt = jwt
    this.#_prisma = prisma
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>()
    const token = req.header('x-user-token')

    if (!token) {
      throw new UnauthorizedException('Authentication token is required')
    }

    const payload = await this.#_jwt.verify(token)

    if (!payload) {
      throw new UnauthorizedException('Invalid or expired token')
    }

    const user = await this.#_prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    })

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    if (user.deletedAt) {
      throw new ForbiddenException('Account has been deactivated')
    }

    this.#_cls.set('user', {
      id: user.id,
      avatar: user.avatar,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      email: user.email,
      createdAt: user.createdAt,
      role: user.role,
      updatedAt: user.updatedAt,
    })

    return true
  }
}
