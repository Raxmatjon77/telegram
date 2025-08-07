import { Tokens } from './types'
import { AuthService } from './auth.service'
import { UserRefreshDto, UserSigninDto, UserSignupDto } from './dto'
import { UserSigninResponse, UserSignupResponse } from './interface'
import { Body, Controller, HttpCode, Post, HttpStatus, Injectable } from '@nestjs/common'

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
  SignUp(@Body() dto: UserSignupDto): Promise<UserSignupResponse> {
    console.log('dto: ', dto)
    return this.#_service.signUp(dto)
  }

  @Post('/signin')
  @HttpCode(HttpStatus.OK)
  SignIn(@Body() dto: UserSigninDto): Promise<UserSigninResponse> {
    return this.#_service.signIn(dto)
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() payload: UserRefreshDto): Promise<Tokens> {
    return this.#_service.refresh(payload)
  }
}
