import config from 'config'
import jwt from 'jsonwebtoken'

import { UserTokenModel } from '../models/user-token.model'
import type { UserTokenResponse } from '../types/user-token.types'

const jwtSecretKey: string = config.get('jwt.secretKey')
const jwtExpiry: number = config.get('jwt.expiry')

export type PAYLOAD = {
  googleUser: any
  exp: number
}

type DECODED_PAYLOAD = {
  googleUser: any
  iat: number
  exp: number
}

/**
 * Generates the auth token with googleUser in the payload
 */
export function generateAuthToken(googleUser: any) {
  let authToken = null
  const exp = Math.floor(Date.now() / 1000) + jwtExpiry

  try {
    const payload: PAYLOAD = { googleUser, exp }
    authToken = jwt.sign(payload, jwtSecretKey, {
      algorithm: 'HS256',
    })
  } catch (error) {
    console.error('Error occurred while generating the auth token', error)
  }

  const validUntil = new Date(exp * 1000)
  return { authToken, validUntil }
}

/**
 * Verifies whether the auth token is valid or not
 */
export function verifyAuthToken(token: string) {
  try {
    const decodedPayload = jwt.verify(token, jwtSecretKey, {
      algorithms: ['HS256'],
    }) as DECODED_PAYLOAD
    console.info('Decoded payload :', JSON.stringify(decodedPayload))
    return !!decodedPayload.googleUser
  } catch (error) {
    console.error('Error occurred while verifying the auth token', error)
    return false
  }
}

/**
 * Decodes the auth token if auth token is valid
 */
function decodeAuthToken(token: string) {
  try {
    const decodedPayload = jwt.verify(token, jwtSecretKey, {
      algorithms: ['HS256'],
    }) as DECODED_PAYLOAD
    console.info('Decoded payload :', JSON.stringify(decodedPayload))
    return decodedPayload.googleUser
  } catch (error) {
    console.error('Error occurred while decoding the auth token', error)
    return null
  }
}

/**
 * Verifies the validity of the twitter auth token and returns the TwitterUserToken
 */
export async function verifyGoogleAuthTokenAndReturnAccount(
  token: string
): Promise<UserTokenResponse | null> {
  try {
    const userToken = decodeAuthToken(token)
    if (!userToken) {
      return null
    }

    const googleUserToken = await UserTokenModel.findById(userToken._id)
    if (!googleUserToken) {
      return null
    }

    return {
      id: googleUserToken._id,
      email: googleUserToken.email || null,
      googleUserID: googleUserToken.googleUserID || null,
      googleProfilePic: googleUserToken.googleProfilePic || null,
    }
  } catch (error) {
    console.error(
      'Error occurred while fetching google user token from auth token',
      error
    )
    return null
  }
}
