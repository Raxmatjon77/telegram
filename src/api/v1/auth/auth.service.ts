import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common'
import { Tokens } from './types/'
import { UserSignupDto } from './dto'
import { ClsService } from 'nestjs-cls'
import { hash, compare } from '#common'
import { JwtService, PrismaService } from '#services'
import { Language, Role, UserStatus } from '@prisma/client'
import { UserRefreshRequestInterface, UserSigninRequest, UserSigninResponse, UserSignupResponse } from './interface'
import { ulid } from 'ulid'

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

      const session = await this.#_createSession({ userId: newUser.id })
      const tokens = await this.#_generateTokens(newUser.id, newUser.email, session.id)
      
      return {
        id: newUser.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }

      console.error('Signup error:', error.message)
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

      const session = await this.#_createSession({ userId: user.id })
      const tokens = await this.#_generateTokens(user.id, user.email, session.id)

      await this.#_prisma.user.update({
        where: { id: user.id },
        data: { lastSeenAt: new Date() }
      })

      return {
        id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error
      }

      console.error('Signin error:', error.message)
      throw new InternalServerErrorException('Authentication failed')
    }
  }

  async refresh(payload: UserRefreshRequestInterface): Promise<Tokens> {
    const refreshToken = await this.#_prisma.refreshToken.findUnique({
      where: {
        token: payload.refreshToken,
        isRevoked: false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            deletedAt: true,
          }
        }
      }
    })

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    if (refreshToken.user.deletedAt) {
      throw new UnauthorizedException('User account is deactivated')
    }

    if (refreshToken.expiresAt < new Date()) {
      await this.#_revokeRefreshToken(refreshToken.id)
      throw new UnauthorizedException('Refresh token expired')
    }

    await this.#_revokeRefreshToken(refreshToken.id)
    
    const tokens = await this.#_generateTokens(
      refreshToken.user.id, 
      refreshToken.user.email, 
      refreshToken.sessionId
    )

    await this.#_prisma.user.update({
      where: { id: refreshToken.user.id },
      data: { lastSeenAt: new Date() }
    })

    return tokens
  }

  async logout(refreshToken: string): Promise<{ success: boolean }> {
    const token = await this.#_prisma.refreshToken.findUnique({
      where: { token: refreshToken }
    })

    if (token) {
      await this.#_revokeRefreshToken(token.id)
      
      if (token.sessionId) {
        await this.#_terminateSession(token.sessionId)
      }
    }

    return { success: true }
  }

  async logoutAllDevices(userId: string): Promise<{ success: boolean }> {
    await this.#_prisma.refreshToken.updateMany({
      where: {
        userId,
        isRevoked: false
      },
      data: {
        isRevoked: true,
        revokedAt: new Date()
      }
    })

    await this.#_prisma.session.updateMany({
      where: {
        userId,
        isActive: true,
        deletedAt: null
      },
      data: {
        isActive: false,
        deletedAt: new Date()
      }
    })

    return { success: true }
  }

  async getSessions(userId: string) {
    return await this.#_prisma.session.findMany({
      where: {
        userId,
        deletedAt: null,
        isActive: true
      },
      select: {
        id: true,
        device: true,
        deviceId: true,
        platform: true,
        ip: true,
        userAgent: true,
        lastSeen: true,
        createdAt: true
      },
      orderBy: {
        lastSeen: 'desc'
      }
    })
  }

  async getActiveRefreshTokens(userId: string) {
    return await this.#_prisma.refreshToken.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: {
          gt: new Date()
        }
      },
      select: {
        id: true,
        deviceId: true,
        userAgent: true,
        ip: true,
        createdAt: true,
        expiresAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async cleanupExpiredTokens(): Promise<{ deletedCount: number }> {
    const result = await this.#_prisma.refreshToken.updateMany({
      where: {
        expiresAt: {
          lt: new Date()
        },
        isRevoked: false
      },
      data: {
        isRevoked: true,
        revokedAt: new Date()
      }
    })

    return { deletedCount: result.count }
  }

  async #_generateTokens(userId: string, email: string, sessionId?: string): Promise<Tokens> {
    const [accessToken, refreshTokenValue] = await Promise.all([
      this.#_jwt.sign({
        sub: userId,
        email,
        type: 'access',
      }),
      this.#_generateRefreshToken()
    ])

    const refreshTokenExpiresAt = new Date()
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 30)

    await this.#_prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId,
        sessionId,
        userAgent: this.#_cls.get('userAgent'),
        ip: this.#_cls.get('reqIp'),
        deviceId: this.#_cls.get('deviceId'),
        expiresAt: refreshTokenExpiresAt,
      }
    })

    return {
      access_token: accessToken,
      refresh_token: refreshTokenValue,
    }
  }

  async #_generateRefreshToken(): Promise<string> {
    return ulid() + '_' + Date.now().toString(36)
  }

  async #_revokeRefreshToken(tokenId: string): Promise<void> {
    await this.#_prisma.refreshToken.update({
      where: { id: tokenId },
      data: {
        isRevoked: true,
        revokedAt: new Date()
      }
    })
  }

  async #_createSession(payload: { userId: string }): Promise<{ id: string }> {
    const session = await this.#_prisma.session.create({
      data: {
        userId: payload.userId,
        ip: this.#_cls.get('reqIp'),
        device: this.#_cls.get('device'),
        deviceId: this.#_cls.get('deviceId'),
        platform: this.#_cls.get('platform'),
        userAgent: this.#_cls.get('userAgent'),
      },
    })
    return session
  }

  async #_terminateSession(sessionId: string): Promise<void> {
    await this.#_prisma.session.update({
      where: { id: sessionId },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    })
  }
}
