import { IsString } from 'class-validator'
import { UserLogoutInterface } from '../interface'
import { ApiProperty } from '@nestjs/swagger'

export class UserLogoutDto implements UserLogoutInterface {
  @ApiProperty({
    description: 'User ID for logout',
    example: 'user123',
    required: true
  })
  @IsString()
  userId: string
}
