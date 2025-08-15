import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { jwtVerify, SignJWT, JWTPayload } from 'jose'

@Injectable()
export class JwtService {
  readonly #_secret: Uint8Array<ArrayBufferLike>
  readonly #_expiration: string

  constructor(config: ConfigService) {
    this.#_secret = new TextEncoder().encode(config.getOrThrow<string>('jwt.secret'))
    this.#_expiration = config.get<string>('jwt.expiration', '1h')
  }

  async sign(payload: JWTPayload): Promise<string> {
    const date = new Date()
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(date)
      .setNotBefore(date)
      .setExpirationTime(this.#_expiration)
      .sign(this.#_secret)

    return token
  }

  async verify(token: string): Promise<JWTPayload | null> {
    try {
      const { payload } = await jwtVerify(token, this.#_secret, {
        algorithms: ['HS256'],
      })

      return payload
    } catch (error) {
      // Log error for debugging but don't expose details
      console.error('JWT verification failed:', error)
      return null
    }
  }
}
