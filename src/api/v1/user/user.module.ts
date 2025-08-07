import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { PrismaModule,JwtModule } from '#services'
import { ClsModule } from 'nestjs-cls'

@Module({
  imports: [PrismaModule, JwtModule,ClsModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
