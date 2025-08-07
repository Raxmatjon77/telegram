import { ProfileGuard } from '#common'
import { Profile, SearchResponse, UpdateDto } from './dto'
import { UserService } from './user.service'
import { Controller, HttpCode, HttpStatus, Injectable, Get, Patch, UseGuards, Body, Query } from '@nestjs/common'

@Injectable()
@UseGuards(ProfileGuard)
@Controller({
  path: 'user',
  version: '1',
})
export class UserController {
  readonly #_service: UserService
  constructor(service: UserService) {
    this.#_service = service
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  profile(): Promise<Profile> {
    return this.#_service.get()
  }

  @Patch()
  @HttpCode(HttpStatus.NO_CONTENT)
  update(@Body() dto: UpdateDto): Promise<void> {
    return this.#_service.update(dto)
  }

  @Get('search')
  @HttpCode(HttpStatus.OK)
  search(@Query('username') username: string): Promise<SearchResponse> {
    return this.#_service.searchByUsername(username)
  }
}
