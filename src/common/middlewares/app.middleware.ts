import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { ClsService } from 'nestjs-cls'
import { ulid } from 'ulid'

@Injectable()
export class AppMiddleware implements NestMiddleware {
  readonly #_cls: ClsService

  constructor(cls: ClsService) {
    this.#_cls = cls
  }

  use(req: Request, res: Response, next: NextFunction): void {
    req.headers['x-req-id'] = req.headers['x-req-id'] ?? ulid()
    req.headers['x-req-ip'] = req.headers['x-req-ip'] ?? req.ip ?? 'unknown'

    this.#_cls.set('reqId', req.headers['x-req-id'] as string)
    this.#_cls.set('reqIp', req.headers['x-req-ip'] as string)

    next()
  }
}
