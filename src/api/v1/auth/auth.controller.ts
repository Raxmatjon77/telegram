import { Tokens } from './types'
import { AuthService } from './auth.service'
import { UserRefreshDto, UserSigninDto, UserSignupDto } from './dto'
import { UserSigninResponse, UserSignupResponse } from './interface'
import { Body, Controller, HttpCode, Post, HttpStatus, Injectable } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'

@Injectable()
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  readonly #_service: AuthService
  constructor(service: AuthService) {
    this.#_service = service
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
}
