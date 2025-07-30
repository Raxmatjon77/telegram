import { SetMetadata } from '@nestjs/common'
import { ZodType } from 'zod'

export const ZOD_METADATA_KEY = 'zod'
export const Zod = (schema: ZodType) => SetMetadata(ZOD_METADATA_KEY, schema)
