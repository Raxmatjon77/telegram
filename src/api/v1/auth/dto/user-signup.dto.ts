import { Role } from '@prisma/client'
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
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    ),
  username: z
    .string({ error: 'Username is required' })
    .min(3, 'Username must be at least 3 characters long')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  phone: z
    .string({ error: 'Phone number is required' })
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number'),
  role: z.nativeEnum(Role).default(Role.user).optional(),
})

@Zod(schema)
export class UserSignupDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    required: true
  })
  email: string

  @ApiProperty({
    description: 'User password (must contain at least one uppercase letter, one lowercase letter, and one number)',
    example: 'Password123',
    required: true,
    minLength: 8
  })
  password: string

  @ApiProperty({
    description: 'Username (can only contain letters, numbers, and underscores)',
    example: 'john_doe',
    required: true,
    minLength: 3,
    maxLength: 30
  })
  username: string

  @ApiProperty({
    description: 'Phone number (valid international format)',
    example: '+1234567890',
    required: true,
    minLength: 10
  })
  phone: string

  @ApiProperty({
    description: 'User role (admin or user)',
    example: 'user',
    required: false,
    enum: Role
  })
  role?: Role
}
