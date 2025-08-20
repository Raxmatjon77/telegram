import { ProfileGuard } from '#common'
import { Profile, SearchResponse, UpdateDto } from './dto'
import { UserService } from './user.service'
import { Controller, HttpCode, HttpStatus, Injectable, Get, Patch, UseGuards, Body, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'

@Injectable()
@UseGuards(ProfileGuard)
@Controller({
  path: 'user',
  version: '1',
})
@ApiTags('user')
export class UserController {
  readonly #_service: UserService
  constructor(service: UserService) {
    this.#_service = service
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user profile', description: 'Retrieve the profile information of the authenticated user' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved user profile', type: Profile })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing authentication' })
  @ApiBearerAuth()
  profile(): Promise<Profile> {
    return this.#_service.get()
  }

  @Patch()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update user profile', description: 'Update the profile information of the authenticated user' })
  @ApiResponse({ status: 204, description: 'User profile successfully updated' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing authentication' })
  @ApiBearerAuth()
  @ApiBody({ type: UpdateDto })
  update(@Body() dto: UpdateDto): Promise<void> {
    return this.#_service.update(dto)
  }

  @Get('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search users', description: 'Search for users by username' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved search results', type: SearchResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing authentication' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'username', description: 'Username to search for', required: true })
  search(@Query('username') username: string): Promise<SearchResponse> {
    return this.#_service.searchByUsername(username)
  }
}
