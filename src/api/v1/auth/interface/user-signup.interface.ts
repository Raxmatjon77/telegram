import { Role } from '@prisma/client'

export declare interface UserSignupRequest {
  email: string
  password: string
  name: string
  phone?: string
  role?: Role
  username:string
  
}

export declare interface UserSignupResponse {
  id: string
  access_token: string
  refresh_token: string
}
