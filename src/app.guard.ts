import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'

@Injectable()
export class AppGuard implements CanActivate {
  readonly #_token: string

  constructor(config: ConfigService) {
    this.#_token = config.getOrThrow<string>('app.token')
  }

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>()
    const token = req.header('x-app-token')

    if (!token) {
      throw new UnauthorizedException('App token is required')
    }

    if (token !== this.#_token) {
      throw new UnauthorizedException('Invalid app token')
    }

    return true
  }
}
