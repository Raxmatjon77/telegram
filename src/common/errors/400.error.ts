import { ApiProperty } from '@nestjs/swagger'
import { HttpMessage } from '../enums/http-message.enum'

export class Error400 {
  @ApiProperty({ example: HttpMessage.BAD_REQUEST })
  message: HttpMessage.BAD_REQUEST
}
