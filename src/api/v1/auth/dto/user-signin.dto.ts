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
  password: z.string('Amount is required').min(1, 'password is required'),

  email: z.string('email ID is required').min(1, 'email email is required'),
})

@Zod(schema)
export class UserSigninDto {
  password: string
  email: string
}
