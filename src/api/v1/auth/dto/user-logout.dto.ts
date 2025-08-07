import { IsString } from 'class-validator'
import { UserLogoutInterface } from '../interface'
export class UserLogoutDto implements UserLogoutInterface {
  @IsString()
  userId: string
}
