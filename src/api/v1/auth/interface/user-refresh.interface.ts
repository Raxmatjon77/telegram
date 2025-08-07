export interface UserRefreshRequestInterface {
  refresh_token: string
  userId: string
}

export interface UserRefreshResponseInterface {
  access_token: string
  refresh_token: string
}
