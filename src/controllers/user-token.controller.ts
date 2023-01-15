import config from 'config'
import type { Request, Response } from 'express'

import { handleError, handleSuccess } from '../lib/base'
import {
  fetchAllGoogleUserTokensFromWeb2,
  fetchGoogleUserTokenFromDB,
  // updateUserTokenWeb2ProfileInDB,
  initiateGoogleLoginDB,
  completeGoogleLoginDB,
} from '../services/user-token.service'
import type {
  UserTokenResponse,
  UserTokensQueryOptions,
} from '../types/user-token.types'

const CLIENT_HOST_URL = config.get<string>('client.hostUrl')

// Initiate login of user by generating Google auth URL they will be redirected to on login button click
export async function initiateGoogleLogin(req: Request, res: Response) {
  try {
    const googleVerification = await initiateGoogleLoginDB()
    return handleSuccess(res, { googleVerification })
  } catch (error) {
    console.error('Error occurred while initiating Google login', error)
    return handleError(res, error, 'Unable to initiate Google login')
  }
}

// Complete login by verifying using data sent from google API
// Once user finishes logging into Google, user is redirected to callbackURL defined in Google console. Callback will be backend endpoint, which then gets called and then it redirects user to client home page.
export async function completeGoogleLogin(req: Request, res: Response) {
  try {
    const reqParams = req.query
    const googleVerification = await completeGoogleLoginDB({
      code: reqParams.code as string,
    })

    // This is where auth cookie is named
    res.cookie('auth_token', googleVerification.googleJwt, {
      expires: googleVerification.validUntil,
      httpOnly: false,
      secure: false,
    })

    res.redirect(CLIENT_HOST_URL)

    // return handleSuccess(res, { googleVerification })
    return
  } catch (error) {
    console.error('Error occurred while completing Google verification', error)
    return handleError(res, error, 'Unable to complete Google verification')
  }
}

// Fetch User Token
export async function fetchGoogleUserToken(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as
      | UserTokenResponse
      | null
      | undefined
    const email = req.query.email ? (req.query.email as string) : null
    const userTokenID = req.query.userTokenID
      ? (req.query.userTokenID as string)
      : (decodedAccount?.id as string)

    const userToken = await fetchGoogleUserTokenFromDB({
      userTokenID,
      email,
    })

    return handleSuccess(res, { userToken })
  } catch (error) {
    console.error('Error occurred while fetching google user token', error)
    return handleError(res, error, 'Unable to fetch the google user token')
  }
}

export async function fetchAllGoogleUserTokens(req: Request, res: Response) {
  try {
    const skip = Number.parseInt(req.query.skip as string) || 0
    const limit = Number.parseInt(req.query.limit as string) || 10
    const orderBy = req.query.orderBy as keyof UserTokenResponse
    const orderDirection =
      (req.query.orderDirection as string | undefined) ?? 'desc'
    const search = (req.query.search as string) || null

    const options: UserTokensQueryOptions = {
      skip,
      limit,
      orderBy,
      orderDirection,
      search,
    }

    const userTokens = await fetchAllGoogleUserTokensFromWeb2(options)
    return handleSuccess(res, { userTokens })
  } catch (error) {
    console.error('Error occurred while fetching all the user tokens', error)
    return handleError(res, error, 'Unable to fetch the user tokens')
  }
}
