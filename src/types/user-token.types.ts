export type UserTokenRequest = {
  id: string
  email: string | null
}

export type UserTokenResponse = {
  id: string
  googleUserID: string | null
  email: string | null
  googleProfilePic: string | null
}

export type UserTokensQueryOptions = {
  skip: number
  limit: number
  orderBy: keyof UserTokenResponse
  orderDirection: string
  search: string | null
}

export type GoogleLoginInitiation = {
  authorizationUrl?: string
}

export type GoogleLoginCompletion = {
  googleJwt: string
  validUntil: Date
  // userTokenCreated: boolean
  userToken: UserTokenResponse | null
}
