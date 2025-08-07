import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '#services'

@Module({
  imports: [JwtModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
