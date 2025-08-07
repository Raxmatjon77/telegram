import { User, Zod } from '#common'
import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

export const searchDto = z.object({
  username: z.string().min(1),
})

export type Search = z.infer<typeof searchDto>

@Zod(searchDto)
export class SearchDto {
  @ApiProperty({
    description: 'The username of the user',
    example: 'john_doe',
  })
  username: string
}


export class SearchResponse {
  @ApiProperty({
    description: 'The user',
  })
  id: string

  @ApiProperty({
    description: 'The username of the user',
    example: 'john_doe',
  })
  username: string

  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
  })
  firstName: string

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
  })
  lastName: string

  @ApiProperty({
    description: 'The avatar of the user',
    example: 'https://example.com/avatar.png',
  })
  avatar: string

  @ApiProperty({
    description: 'The email of the user',
    example: 'john_doe@example.com',
  })
  email: string
}