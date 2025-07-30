import { ApiProperty } from '@nestjs/swagger'
import { HttpMessage } from '../enums/http-message.enum'

export class Error401 {
  @ApiProperty({ example: HttpMessage.UNAUTHORIZED })
  message: HttpMessage.UNAUTHORIZED
}
