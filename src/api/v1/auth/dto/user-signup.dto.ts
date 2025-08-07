import { IsEnum, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator'
import { UserSignupRequest } from '../interface'
import { Role } from '@prisma/client'
import z from 'zod'
import { Zod } from '#common'

// export class UserSignupDto implements UserSignupRequest {
//   @IsString()
//   @IsNotEmpty()
//   email: string

//   @IsString()
//   @Length(8)
//   @IsNotEmpty()
//   password: string

//   @IsString()
//   @IsNotEmpty()
//   name: string

//   @IsOptional()
//   @IsEnum(Role)
//   @IsString()
//   role?: Role

//   username: string
// }

const schema = z.object({
  password: z.string('Amount is required').min(1, 'Amount is required'),

  
  email: z.string('email ID is required').min(1, 'email email is required'),
  phone: z.string('User ID is required').min(1, 'User ID is required'),
  username: z.string('User ID is required').min(1, 'User ID is required'),
  role: z.string('User ID is required').min(1, 'User ID is required'),
})

@Zod(schema)
export class UserSignupDto {
  password: string
  email: string
  phone: string
  username: string
  role: string
}
