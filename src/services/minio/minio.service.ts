import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Client } from 'minio'

@Injectable()
export class MinioService {
  readonly #_client: Client
  readonly #_url: string
  readonly #_port: string
  readonly #_user: string
  readonly #_pass: string

  constructor(config: ConfigService) {
    this.#_url = config.get<string>('minio.url', 'localhost')
    this.#_pass = config.getOrThrow<string>('minio.pass')
    this.#_user = config.getOrThrow<string>('minio.user')
    this.#_port = config.getOrThrow<string>('minio.port')

    this.#_client = new Client({
      endPoint: this.#_url,
      port: parseInt(this.#_port),
      useSSL: false,
      accessKey: this.#_user,
      secretKey: this.#_pass,
    })
  }

  async uploadFile(bucket: string, file: Express.Multer.File): Promise<string> {
    const objectName = `${Date.now()}-${file.originalname}`

    await this.#_client
      .putObject(bucket, objectName, file.buffer, file.size, {
        'Content-Type': file.mimetype,
      })
      .catch((err) => {
        console.log(err)
      })

    return objectName
  }
  
  async getFileUrl(bucket: string, objectName: string): Promise<string> {
    return await this.#_client.presignedGetObject(bucket, objectName)
  }

  async deleteFile(bucket: string, objectName: string): Promise<void> {
    await this.#_client.removeObject(bucket, objectName)
  }
}
