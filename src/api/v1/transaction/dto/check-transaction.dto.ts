import { ApiProperty } from '@nestjs/swagger'
import z from 'zod'
import { Zod } from '#common'

const schema = z.object({
  amount: z.number('Amount is required').min(1, 'Amount is required'),
  serviceId: z.string('Service ID is required').min(1, 'Service ID is required'),
  userId: z.string('User ID is required').min(1, 'User ID is required'),
})

export declare type CheckTransaction = z.infer<typeof schema>

@Zod(schema)
export class CheckTransactionDto implements CheckTransaction {
  @ApiProperty({
    example: 100,
  })
  amount: number

  @ApiProperty({
    example: 'service_id',
  })
  serviceId: string

  @ApiProperty({
    example: 'user_id',
  })
  userId: string
}
