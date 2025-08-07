import { Zod } from '#common'
import { ApiProperty } from '@nestjs/swagger'
import z from 'zod'

const schema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  avatar: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
})

export declare type ProfileSchema = z.infer<typeof schema>

@Zod(schema)
export class Profile implements ProfileSchema {
  @ApiProperty({
    description: 'The username of the user',
    example: 'john_doe',
  })
  username: string

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
    description: 'The avatar of the user',
    example: 'https://example.com/avatar.png',
  })
  avatar: string

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
}
