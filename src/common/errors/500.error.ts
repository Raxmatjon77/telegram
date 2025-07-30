import { ApiProperty } from '@nestjs/swagger'
import { HttpMessage } from '../enums/http-message.enum'

export class Error500 {
  @ApiProperty({ example: HttpMessage.INTERNAL_SERVER_ERROR })
  message: HttpMessage.INTERNAL_SERVER_ERROR
}
