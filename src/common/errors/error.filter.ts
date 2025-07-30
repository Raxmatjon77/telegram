import { Catch, HttpException, ArgumentsHost, ExceptionFilter } from '@nestjs/common'
import { Response } from 'express'
import { HttpStatus } from '../enums/http-status.enum'

@Catch()
export class ErrorFilter implements ExceptionFilter {
  catch(err: any, host: ArgumentsHost): Response {
    const http = host.switchToHttp()
    const res = http.getResponse<Response>()

    if (err instanceof HttpException) {
      const status = err.getStatus()

      return res.status(status).json({
        message: status === HttpStatus.UNPROCESSABLE_ENTITY ? err.getResponse() : err.message,
      })
    }

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Unknown Error',
    })
  }
}
