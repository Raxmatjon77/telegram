import { ApiProperty } from '@nestjs/swagger'
import { HttpMessage } from '../enums/http-message.enum'

export class Error429 {
  @ApiProperty({ example: HttpMessage.TOO_MANY_REQUESTS })
  message: HttpMessage.TOO_MANY_REQUESTS
}
