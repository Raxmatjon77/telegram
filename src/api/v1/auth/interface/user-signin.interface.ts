export declare interface UserSigninRequest {
  email: string
  password: string
}

export declare interface UserSigninResponse {
  id: string
  access_token: string
  refresh_token: string
}
