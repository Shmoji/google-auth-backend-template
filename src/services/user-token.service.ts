import axios from 'axios'
import escapeStringRegexp from 'escape-string-regexp'
import type { FilterQuery } from 'mongoose'

import { UserTokenModel } from '../models/user-token.model'
import type { UserTokenDocument } from '../models/user-token.model'
import type {
  GoogleLoginCompletion,
  GoogleLoginInitiation,
  UserTokensQueryOptions,
} from '../types/user-token.types'
import { generateAuthToken } from '../util/jwtTokenUtil'
import { getGoogleAuthURL, getTokens } from '../util/oauthUtil'
import { mapUserTokenResponse } from '../util/userTokenUtil'
import { InternalServerError } from './errors'

export async function initiateGoogleLoginDB(): Promise<GoogleLoginInitiation> {
  const googleAuthURL = getGoogleAuthURL()
  return {
    authorizationUrl: googleAuthURL,
  }
}

// Once user finishes logging into Google, user is redirected to callbackURL defined in Google console. Callback will be backend endpoint, which then gets called and then it redirects user to client home page.
export async function completeGoogleLoginDB({
  code,
}: {
  code: string
}): Promise<GoogleLoginCompletion> {
  const { id_token, access_token } = (await getTokens({
    code,
  })) as any

  // Fetch the user's profile with the access token and bearer
  const googleUserResponse = await axios.get(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${
      access_token as string
    }`,
    {
      headers: {
        Authorization: `Bearer ${id_token as string}`,
      },
    }
  )
  const googleUser = googleUserResponse.data

  if (!googleUser) {
    throw new InternalServerError(
      'Error occured while fetching the users profile'
    )
  }

  // Create new user or update old user

  const createdUserToken = await UserTokenModel.findOneAndUpdate(
    { email: googleUser.email },
    {
      $set: {
        googleUserID: googleUser.id,
        email: googleUser.email,
        googleProfilePic: googleUser.picture,
      },
    },
    { new: true, upsert: true }
  )

  const { authToken, validUntil } = generateAuthToken(
    createdUserToken.toObject()
  )
  if (!authToken) {
    throw new InternalServerError('Error occured while generating auth token')
  }

  return {
    googleJwt: authToken,
    validUntil,
    userToken: null,
  }
}

export async function fetchGoogleUserTokenFromDB({
  userTokenID,
  email,
}: {
  userTokenID: string | null
  email: string | null
}) {
  let userTokenDoc: UserTokenDocument | null = null

  if (userTokenID) {
    userTokenDoc = await UserTokenModel.findById(userTokenID)
  } else if (email) {
    userTokenDoc = await UserTokenModel.findOne({ email })
  } else {
    userTokenDoc = null
  }

  if (!userTokenDoc) {
    return null
  }

  return mapUserTokenResponse(userTokenDoc)
}

export async function fetchAllGoogleUserTokensFromWeb2(
  options: UserTokensQueryOptions
) {
  try {
    const { skip, limit, orderBy, search } = options
    const orderDirection = options.orderDirection === 'asc' ? 1 : -1

    // Sorting Options
    const sortOptions: any = {}
    sortOptions[orderBy] = orderDirection
    sortOptions._id = 1

    // Filter Options
    const filterOptions: FilterQuery<UserTokenDocument>[] = []
    if (search) {
      filterOptions.push({
        $or: [
          { email: { $regex: escapeStringRegexp(search), $options: 'i' } },
          { username: { $regex: escapeStringRegexp(search), $options: 'i' } },
          { bio: { $regex: escapeStringRegexp(search), $options: 'i' } },
          {
            twitterUsername: {
              $regex: escapeStringRegexp(search),
              $options: 'i',
            },
          },
        ],
      })
    }

    // Filter Query
    let filterQuery = {}
    if (filterOptions.length > 0) {
      filterQuery = { $and: filterOptions }
    }

    const twitterUserTokens = await UserTokenModel.find(filterQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)

    return twitterUserTokens.map((userToken) => mapUserTokenResponse(userToken))
  } catch (error) {
    console.error('Error occurred while fetching user tokens', error)
    throw new InternalServerError('Error occurred while fetching user tokens')
  }
}

// async function updateUserTokenInWeb2(userToken: TwitterUserTokenRequest) {
//   try {
//     const twitterUsername = userToken.twitterUsername.toLowerCase()
//     const userOpinionsSummary = await getUserOpinionsSummary(twitterUsername)

//     const userToken = await UserTokenModel.findOne({ twitterUsername })

//     if (userToken) {
//       return userToken
//     }

//     const userTokenDoc: ITwitterUserToken = {
//       twitterUsername: userToken.twitterUsername.toLowerCase(),
//     }

//     return await UserTokenModel.create(userTokenDoc)
//   } catch (error) {
//     console.error('Error occurred while updating user tokens in DB', error)
//     throw new InternalServerError('Failed to update user token in DB')
//   }
// }
