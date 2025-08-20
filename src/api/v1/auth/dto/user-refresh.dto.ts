import { IsString, IsNotEmpty } from 'class-validator'
import { UserRefreshRequestInterface } from '../interface'
import { ApiProperty } from '@nestjs/swagger'

export class UserRefreshDto implements UserRefreshRequestInterface {
  @ApiProperty({
    description: 'Refresh token for obtaining a new access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string
}
