import { Zod } from '#common'
import { ApiProperty } from '@nestjs/swagger'
import { ChatType } from '@prisma/client'
import z from 'zod'

export const createDto = z.object({
  title: z.string().min(1),
  type: z.nativeEnum(ChatType).default('group'),
  
})

export type Create = z.infer<typeof createDto>

@Zod(createDto)
export class CreateDto implements Create {
  @ApiProperty({
    description: 'The title of the chat',
    example: 'Team Meeting',
    required: true
  })
  title: string

  @ApiProperty({
    description: 'The type of the chat',
    enum: ChatType,
    example: 'group',
    required: false
  })
  type: ChatType
}
