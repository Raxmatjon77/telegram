import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { JwtService, PrismaService } from '#services'
import { Tokens } from './types/'


import {
  UserRefreshRequestInterface,
  UserSigninRequest,
  UserSigninResponse,
  // UserSignupRequest,
  UserSignupResponse,
} from './interface'
import { hash, compare } from '#common'
import { Language, Role, UserStatus } from '@prisma/client'
import { UserSignupDto } from './dto'

@Injectable()
export class AuthService {
  readonly #_prisma: PrismaService
  readonly #_jwt: JwtService
  constructor(prisma: PrismaService, jwt: JwtService) {
    this.#_prisma = prisma
    this.#_jwt = jwt
  }

  async signUp(dto: UserSignupDto): Promise<UserSignupResponse> {
    try {
      const existuser = await this.#_prisma.user.findFirst({
        where: {
          email: dto.email,
          deletedAt: null,
        },
      })

      if (existuser) {
        throw new BadRequestException('User with this email is already exist !')
      }

      const hashedPassword = await hash(dto.password)
      const newUser = await this.#_prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          role: Role.user,
          username: dto.username,
          language: Language.eng,
          status: UserStatus.offline,
        },
      })

      const tokens = await this.#_getTokens(newUser.id, newUser.email)

      return {
        id: newUser.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      }
    } catch (error) {
      console.log(error)

      throw error
    }
  }

  async signIn(dto: UserSigninRequest): Promise<UserSigninResponse> {
    const user = await this.#_prisma.user.findUnique({
      where: {
        email: dto.email,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    })

    if (!user) throw new NotFoundException('User Not found !')

    console.log('after finding user')

    const passwordMatches = await compare(dto.password, user.password)

    if (!passwordMatches) {
      throw new ForbiddenException('Access denied !')
    }

    const tokens = await this.#_getTokens(user.id, user.email)

    return {
      id: user.id,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    }
  }

  async refresh(payload: UserRefreshRequestInterface): Promise<Tokens> {
    const user = await this.#_prisma.user.findUnique({
      where: {
        id: payload.userId,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
      },
    })

    if (!user) throw new NotFoundException('User not Found !')

    const tokens = await this.#_getTokens(user.id, user.email)

    return tokens
  }

  // async getUser(token: string) {
  //     const decoded = await this.#_jwt.verify(token, {)

  //   console.log('decoded: ', decoded)

  //   const user = await this.#_prisma.user.findUnique({
  //     where: {
  //       id: decoded.sub,
  //     },
  //     select: {
  //       id: true,
  //     },
  //   })
  //   if (!user) throw new NotFoundException('User not found !')
  //   return user
  // }

  async #_getTokens(UserId: string, email: string): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.#_jwt.sign(
        {
          sub: UserId,
          email,
          type: 'access',
        },
      ),
      this.#_jwt.sign(
        {
          sub: UserId,
          email,
          type: 'refresh',
        },
      ),
    ])

    return {
      access_token: at,
      refresh_token: rt,
    }
  }
}
