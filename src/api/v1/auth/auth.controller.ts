import { Tokens } from './types'
import { AuthService } from './auth.service'
import { UserRefreshDto, UserSigninDto, UserSignupDto } from './dto'
import { UserSigninResponse, UserSignupResponse } from './interface'
import { Body, Controller, HttpCode, Post, HttpStatus, Injectable, Get, UseGuards, Delete, Param } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { ProfileGuard } from '#common'
import { ClsService } from 'nestjs-cls'
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger'

@Injectable()
@ApiTags('auth')
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
  @ApiOperation({ summary: 'User signup', description: 'Register a new user account with email, password, username, and phone number' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
  @ApiResponse({ status: 422, description: 'Unprocessable entity - validation failed' })
  @ApiBody({ type: UserSignupDto })
  SignUp(@Body() dto: UserSignupDto): Promise<UserSignupResponse> {
    return this.#_service.signUp(dto)
  }

  @Post('/signin')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'User signin', description: 'Authenticate user with email and password to receive access and refresh tokens' })
  @ApiResponse({ status: 200, description: 'User successfully authenticated' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid credentials' })
  @ApiBody({ type: UserSigninDto })
  SignIn(@Body() dto: UserSigninDto): Promise<UserSigninResponse> {
    return this.#_service.signIn(dto)
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ medium: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Refresh token', description: 'Refresh access token using a valid refresh token' })
  @ApiResponse({ status: 200, description: 'Token successfully refreshed' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or expired refresh token' })
  @ApiBody({ type: UserRefreshDto })
  refresh(@Body() payload: UserRefreshDto): Promise<Tokens> {
    return this.#_service.refresh(payload)
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ProfileGuard)
  @ApiOperation({ summary: 'User logout', description: 'Invalidate a specific refresh token for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Token successfully invalidated' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing authentication' })
  @ApiBearerAuth()
  async logout(@Body('refreshToken') refreshToken: string): Promise<{ success: boolean }> {
    return this.#_service.logout(refreshToken)
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ProfileGuard)
  @ApiOperation({ summary: 'Logout from all devices', description: 'Invalidate all refresh tokens for the authenticated user across all devices' })
  @ApiResponse({ status: 200, description: 'All tokens successfully invalidated' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing authentication' })
  @ApiBearerAuth()
  async logoutAllDevices(): Promise<{ success: boolean }> {
    const user = this.#_cls.get('user')
    return this.#_service.logoutAllDevices(user.id)
  }

  @Get('sessions')
  @UseGuards(ProfileGuard)
  @ApiOperation({ summary: 'Get user sessions', description: 'Retrieve all active sessions for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved user sessions' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing authentication' })
  @ApiBearerAuth()
  async getSessions() {
    const user = this.#_cls.get('user')
    return this.#_service.getSessions(user.id)
  }

  @Get('refresh-tokens')
  @UseGuards(ProfileGuard)
  @ApiOperation({ summary: 'Get active refresh tokens', description: 'Retrieve all active refresh tokens for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved active refresh tokens' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing authentication' })
  @ApiBearerAuth()
  async getActiveRefreshTokens() {
    const user = this.#_cls.get('user')
    return this.#_service.getActiveRefreshTokens(user.id)
  }

  @Post('cleanup-expired-tokens')
  @HttpCode(HttpStatus.OK)
  @Throttle({ long: { limit: 1, ttl: 300000 } })
  @ApiOperation({ summary: 'Cleanup expired tokens', description: 'Remove expired refresh tokens from the database (administrative endpoint)' })
  @ApiResponse({ status: 200, description: 'Successfully cleaned up expired tokens' })
  async cleanupExpiredTokens(): Promise<{ deletedCount: number }> {
    return this.#_service.cleanupExpiredTokens()
  }
}
