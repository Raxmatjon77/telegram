import { ApiProperty } from '@nestjs/swagger'
import { HttpMessage } from '../enums/http-message.enum'

export class Error403 {
  @ApiProperty({ example: HttpMessage.FORBIDDEN })
  message: HttpMessage.FORBIDDEN
}
