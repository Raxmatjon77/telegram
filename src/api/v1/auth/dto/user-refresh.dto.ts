import { IsString } from 'class-validator'
import { IsNotEmpty } from 'class-validator'
import { UserRefreshRequestInterface } from '../interface'

export class UserRefreshDto implements UserRefreshRequestInterface {
  @IsString()
  @IsNotEmpty()
  refresh_token: string

  @IsString()
  @IsNotEmpty()
  userId: string
}
