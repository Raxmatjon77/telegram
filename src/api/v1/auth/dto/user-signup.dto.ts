import { Role } from '@prisma/client'
import z from 'zod'
import { Zod } from '#common'

const schema = z.object({
  password: z.string('password is required').min(1, 'password is required'),
  email: z.string('email ID is required').min(1, 'email ID is required'),
  phone: z.string('phone is required').min(1, 'phone is required'),
  username: z.string('username is required').min(1, 'username is required'),
  role: z.string('role is required').default('USER').optional(),
})

@Zod(schema)
export class UserSignupDto {
  password: string
  email: string
  phone: string
  username: string
  role: Role
}
