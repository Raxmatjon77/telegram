import { Tokens } from './types'
import { AuthService } from './auth.service'
import { UserRefreshDto, UserSigninDto, UserSignupDto } from './dto'
import { UserSigninResponse, UserSignupResponse } from './interface'
import { Body, Controller, HttpCode, Post, HttpStatus, Injectable, Get, UseGuards, Delete, Param } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { ProfileGuard } from '#common'
import { ClsService } from 'nestjs-cls'

@Injectable()
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  readonly #_service: AuthService
  readonly #_cls: ClsService
  
  constructor(service: AuthService, cls: ClsService) {
    this.#_service = service
    this.#_cls = cls
  }

  @Post('/signup')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ short: { limit: 2, ttl: 60000 } })
  SignUp(@Body() dto: UserSignupDto): Promise<UserSignupResponse> {
    return this.#_service.signUp(dto)
  }

  @Post('/signin')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 3, ttl: 60000 } })
  SignIn(@Body() dto: UserSigninDto): Promise<UserSigninResponse> {
    return this.#_service.signIn(dto)
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ medium: { limit: 10, ttl: 60000 } })
  refresh(@Body() payload: UserRefreshDto): Promise<Tokens> {
    return this.#_service.refresh(payload)
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ProfileGuard)
  async logout(@Body('refreshToken') refreshToken: string): Promise<{ success: boolean }> {
    return this.#_service.logout(refreshToken)
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ProfileGuard)
  async logoutAllDevices(): Promise<{ success: boolean }> {
    const user = this.#_cls.get('user')
    return this.#_service.logoutAllDevices(user.id)
  }

  @Get('sessions')
  @UseGuards(ProfileGuard)
  async getSessions() {
    const user = this.#_cls.get('user')
    return this.#_service.getSessions(user.id)
  }

  @Get('refresh-tokens')
  @UseGuards(ProfileGuard)
  async getActiveRefreshTokens() {
    const user = this.#_cls.get('user')
    return this.#_service.getActiveRefreshTokens(user.id)
  }

  @Delete('sessions/:sessionId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ProfileGuard)
  async terminateSession(@Param('sessionId') sessionId: string): Promise<{ success: boolean }> {
    await this.#_service['_terminateSession'](sessionId)
    return { success: true }
  }

  @Post('cleanup-expired-tokens')
  @HttpCode(HttpStatus.OK)
  @Throttle({ long: { limit: 1, ttl: 300000 } })
  async cleanupExpiredTokens(): Promise<{ deletedCount: number }> {
    return this.#_service.cleanupExpiredTokens()
  }
}
