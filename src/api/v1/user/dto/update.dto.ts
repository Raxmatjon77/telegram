import { Zod } from '#common'
import { ApiProperty } from '@nestjs/swagger'
import z from 'zod'

const schema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  avatar: z.string().min(1).optional(),
  username: z.string().min(1).optional(),

})

export declare type UpdateSchema = z.infer<typeof schema>

@Zod(schema)
export class UpdateDto implements UpdateSchema {
  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@example.com',
  })
  email: string

  @ApiProperty({
    description: 'The phone number of the user',
    example: '+1234567890',
  })
  phone: string

  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
  })
  firstName: string

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
  })
  lastName: string

  @ApiProperty({
    description: 'The avatar of the user',
    example: 'https://example.com/avatar.png',
  })
  avatar: string

  @ApiProperty({
    description: 'The username of the user',
    example: 'john.doe',
  })
  username: string
}
