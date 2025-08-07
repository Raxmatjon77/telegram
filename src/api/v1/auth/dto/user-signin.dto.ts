import { IsNotEmpty, IsString, Length } from 'class-validator'
import { UserSigninRequest } from '../interface'

export class UserSigninDto implements UserSigninRequest {
  @IsString()
  @IsNotEmpty()
  email: string

  @IsString()
  @Length(8)
  @IsNotEmpty()
  password: string
}
