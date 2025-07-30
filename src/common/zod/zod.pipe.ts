import { Reflector } from '@nestjs/core'
import { Injectable, PipeTransform, ArgumentMetadata, UnprocessableEntityException } from '@nestjs/common'
import { ZodType } from 'zod'
import { ZOD_METADATA_KEY } from './zod.decorator'

@Injectable()
export class ZodPipe implements PipeTransform {
  readonly #_reflector: Reflector

  constructor(reflector: Reflector) {
    this.#_reflector = reflector
  }

  transform(value: any, metadata: ArgumentMetadata): any {
    const schema = this.#_reflector.get<ZodType>(ZOD_METADATA_KEY, metadata.metatype)

    if (!schema) {
      return value
    }

    const result = schema.safeParse(value)

    if (!result.success) {
      const message: Record<string, string[]> = {}

      result.error.issues.forEach((issue) => {
        const path = issue.path.join('.')

        if (!message[path]) {
          message[path] = []
        }

        message[path].push(issue.message)
      })

      throw new UnprocessableEntityException(message)
    }

    return result.data
  }
}
