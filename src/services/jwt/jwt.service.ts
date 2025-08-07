import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { jwtVerify, SignJWT, JWTPayload } from 'jose'

@Injectable()
export class JwtService {
  readonly #_secret: Uint8Array<ArrayBufferLike>
  readonly #_expiration: number

  constructor(config: ConfigService) {
    this.#_secret = new TextEncoder().encode(config.getOrThrow<string>('jwt.secret'))
    this.#_expiration = config.getOrThrow<number>('jwt.expiration')
  }

  async sign(payload: JWTPayload): Promise<string> {
    const date = new Date()
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(date)
      .setNotBefore(date)
      .setExpirationTime(new Date(date.getTime() + 3600000000))
      .sign(this.#_secret)

    return token
  }

  async verify(token: string): Promise<JWTPayload> {
    try {
      const { payload } = await jwtVerify(token, this.#_secret, {
        algorithms: ['HS256'],
      })

      return payload
    } catch (error) {
      console.log('error: ', error)
      return null
    }
  }
}
