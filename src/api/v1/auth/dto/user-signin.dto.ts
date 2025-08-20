import z from 'zod'
import { Zod } from '#common'
import { ApiProperty } from '@nestjs/swagger'

const schema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .email('Please provide a valid email address')
    .min(1, 'Email cannot be empty'),
  password: z
    .string({ error: 'Password is required' })
    .min(1, 'Password cannot be empty'),
})

@Zod(schema)
export class UserSigninDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    required: true
  })
  email: string

  @ApiProperty({
    description: 'User password',
    example: 'Password123',
    required: true
  })
  password: string
}
