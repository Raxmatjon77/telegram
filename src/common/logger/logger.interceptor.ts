import { Injectable, CallHandler, HttpException, NestInterceptor, ExecutionContext } from '@nestjs/common'
import { tap, Observable } from 'rxjs'
import { Request, Response } from 'express'
import { LoggerService } from './logger.service'
import { HttpStatus } from '../enums/http-status.enum'

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  readonly #_logger: LoggerService

  constructor(logger: LoggerService) {
    this.#_logger = logger
    this.#_logger.setContext(LoggerInterceptor.name)
  }

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const http = ctx.switchToHttp()
    const req = http.getRequest<Request>()

    return next.handle().pipe(
      tap({
        next: (data) => {
          const res = http.getResponse<Response>()

          this.#_logger.log({
            rid: req.header('x-request-id'),
            rip: req.header('x-request-ip'),
            url: `${req.method} ${req.url}`,
            req: {
              headers: this.#_getHeaders(req),
              params: Object.keys(req.params).length > 0 ? req.params : undefined,
              query: Object.keys(req.query).length > 0 ? req.query : undefined,
              body: req.body,
            },
            res: {
              headers: res.getHeaders(),
              status: res.statusCode,
              body: data,
            },
          })
        },
        error: (err) => {
          const res = http.getResponse<Response>()

          if (err instanceof HttpException) {
            this.#_logger.log({
              rid: req.header('x-request-id'),
              rip: req.header('x-request-ip'),
              url: `${req.method} ${req.url}`,
              req: {
                headers: this.#_getHeaders(req),
                params: Object.keys(req.params).length > 0 ? req.params : undefined,
                query: Object.keys(req.query).length > 0 ? req.query : undefined,
                body: req.body,
              },
              res: {
                headers: res.getHeaders(),
                status: err.getStatus(),
                body: {
                  message: err.getStatus() === HttpStatus.UNPROCESSABLE_ENTITY ? err.getResponse() : err.message,
                },
              },
            })
          } else if (err instanceof Error) {
            this.#_logger.log({
              rid: req.header('x-request-id'),
              rip: req.header('x-request-ip'),
              url: `${req.method} ${req.url}`,
              req: {
                headers: this.#_getHeaders(req),
                params: Object.keys(req.params).length > 0 ? req.params : undefined,
                query: Object.keys(req.query).length > 0 ? req.query : undefined,
                body: req.body,
              },
              res: {
                headers: res.getHeaders(),
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                body: {
                  message: this.#_getStackOrMessage(err),
                },
              },
            })
          } else {
            this.#_logger.log({
              rid: req.header('x-request-id'),
              rip: req.header('x-request-ip'),
              url: `${req.method} ${req.url}`,
              req: {
                headers: this.#_getHeaders(req),
                params: Object.keys(req.params).length > 0 ? req.params : undefined,
                query: Object.keys(req.query).length > 0 ? req.query : undefined,
                body: req.body,
              },
              res: {
                headers: res.getHeaders(),
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                body: {
                  message: 'Unknown Error',
                },
              },
            })
          }
        },
      }),
    )
  }

  #_getHeaders(req: Request): Record<string, any> {
    const headers: Record<string, any> = {}

    for (const key of Object.keys(req.headers)) {
      if (key.startsWith('sec-') || key.startsWith('x-request-id') || key.startsWith('x-request-ip')) {
        continue
      }

      headers[key] = req.headers[key]
    }

    return headers
  }

  #_getStackOrMessage(err: Error): string {
    if (!err.stack) {
      return err.message
    }

    const stack = err.stack.split('\n').map((line) => line.trim())
    const message = stack.at(0)
    const location = stack.at(-1)

    return `${message} ${location}`
  }
}
