import { ApiProperty } from '@nestjs/swagger'

export class Error422 {
  @ApiProperty({
    type: 'object',
    properties: {
      field: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
  })
  message: object
}
