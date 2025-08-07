import { Injectable, NotFoundException } from '@nestjs/common'
import { JwtService, PrismaService } from '#services'
import { Profile, SearchResponse, UpdateDto } from './dto'
import { ClsService } from 'nestjs-cls'

@Injectable()
export class UserService {
  readonly #_prisma: PrismaService
  readonly #_cls: ClsService
  constructor(prisma: PrismaService, jwt: JwtService, cls: ClsService) {
    this.#_prisma = prisma
    this.#_cls = cls
  }

  async get(): Promise<Profile> {
    return this.#_cls.get('user')
  }

  async update(payload: UpdateDto) {
    const user = await this.#_prisma.user.findFirst({
      where: {
        id: this.#_cls.get('user').id,
      },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    await this.#_prisma.user.update({
      where: { id: user.id },
      data: {
        username: payload.username,
        firstName: payload.firstName,
        lastName: payload.lastName,
        avatar: payload.avatar,
        email: payload.email,
        phone: payload.phone,
      },
    })
  }

  async searchByUsername(username: string): Promise<SearchResponse> {
    const user = await this.#_prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        email: true,
        phone: true,
        role: true,
      },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }
}
