import { IsString, IsNotEmpty } from 'class-validator'
import { UserRefreshRequestInterface } from '../interface'

export class UserRefreshDto implements UserRefreshRequestInterface {
  @IsString()
  @IsNotEmpty()
  refreshToken: string
}
