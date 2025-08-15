import z from 'zod'
import { Zod } from '#common'

const schema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address')
    .min(1, 'Email cannot be empty'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password cannot be empty'),
})

@Zod(schema)
export class UserSigninDto {
  email: string
  password: string
}
