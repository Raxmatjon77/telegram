import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common'
import { Tokens } from './types/'
import { UserSignupDto } from './dto'
import { ClsService } from 'nestjs-cls'
import { hash, compare } from '#common'
import { JwtService, PrismaService } from '#services'
import { Language, Role, UserStatus } from '@prisma/client'
import { UserRefreshRequestInterface, UserSigninRequest, UserSigninResponse, UserSignupResponse } from './interface'

@Injectable()
export class AuthService {
  readonly #_prisma: PrismaService
  readonly #_jwt: JwtService
  readonly #_cls: ClsService
  constructor(prisma: PrismaService, jwt: JwtService, cls: ClsService) {
    this.#_prisma = prisma
    this.#_jwt = jwt
    this.#_cls = cls
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
        throw new BadRequestException('User with this email already exists')
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
      this.#_createSession({ userId: newUser.id })
      return {
        id: newUser.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }

      console.error('Signup error:', error)
      throw new InternalServerErrorException('Registration failed')
    }
  }

  async signIn(dto: UserSigninRequest): Promise<UserSigninResponse> {
    try {
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

      if (!user) throw new NotFoundException('Invalid email or password')

      const passwordMatches = await compare(dto.password, user.password)

      if (!passwordMatches) {
        throw new ForbiddenException('Invalid email or password')
      }

      const tokens = await this.#_getTokens(user.id, user.email)

      this.#_createSession({ userId: user.id })
      return {
        id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error
      }

      console.error('Signin error:', error)
      throw new InternalServerErrorException('Authentication failed')
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

    if (!user) throw new NotFoundException('User not found')

    const tokens = await this.#_getTokens(user.id, user.email)

    return tokens
  }

  async getSessions(userId:string){

    return await this.#_prisma.session.findMany({
      where:{
        deletedAt:null,
        isActive:true
      }
    })
  }
  async #_getTokens(UserId: string, email: string): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.#_jwt.sign({
        sub: UserId,
        email,
        type: 'access',
      }),
      this.#_jwt.sign({
        sub: UserId,
        email,
        type: 'refresh',
      }),
    ])

    return {
      access_token: at,
      refresh_token: rt,
    }
  }

  async #_createSession(payload: { userId: string }): Promise<void> {
    await this.#_prisma.session.create({
      data: {
        ip: this.#_cls.get('reqIp'),
        device: this.#_cls.get('device'),
        userId: payload.userId,
      },
    })
  }

  async #_terminateSession(payload: { userId: string; deviceId: string }): Promise<void> {
    await this.#_prisma.session.update({
      where: {
        userId: payload.userId,
        deviceId: payload.deviceId,
      },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    })
  }
}
