import { Injectable, CanActivate, ExecutionContext, InternalServerErrorException } from '@nestjs/common'
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
      throw new InternalServerErrorException('Invalid credentials')
    }

    if (token !== this.#_token) {
      throw new InternalServerErrorException('Invalid credentials')
    }

    return true
  }
}
