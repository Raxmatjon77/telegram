import { ApiProperty } from '@nestjs/swagger'
import { HttpMessage } from '../enums/http-message.enum'

export class Error404 {
  @ApiProperty({ example: HttpMessage.NOT_FOUND })
  message: HttpMessage.NOT_FOUND
}
