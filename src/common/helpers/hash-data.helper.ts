import { scrypt, randomBytes, timingSafeEqual } from 'crypto'

const SCRYPT_KEY = Number(process.env.SCRYPT_KEY) ? Number(process.env.SCRYPT_KEY) : 32
const SCRYPT_SALT = Number(process.env.SCRYPT_SALT) ? Number(process.env.SCRYPT_SALT) : 16

export const hash = async (value: string): Promise<string> => {
  return new Promise<string>((res, rej): void => {
    const salt = randomBytes(SCRYPT_SALT).toString('hex')

    scrypt(value, salt, SCRYPT_KEY, (err, dKey): void => {
      if (err) {
        rej(err)
      } else {
        res(`${salt}.${dKey.toString('hex')}`)
      }
    })
  })
}

export const compare = async (value: string, hash: string): Promise<boolean> => {
  return new Promise<boolean>((res, rej): void => {
    const [salt, hKey] = hash.split('.')

    scrypt(value, salt, SCRYPT_KEY, (err, dKey): void => {
      if (err) {
        rej(err)
      } else {
        res(timingSafeEqual(dKey, Buffer.from(hKey, 'hex')))
      }
    })
  })
}
