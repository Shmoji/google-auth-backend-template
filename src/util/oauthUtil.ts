import axios from 'axios'
import config from 'config'
import querystring from 'querystring'

const GOOGLE_CLIENT_ID = config.get<string>('auth.google.clientID')
const GOOGLE_CLIENT_SECRET = config.get<string>('auth.google.clientSecret')
const SERVER_HOST_URL = config.get<string>('server.hostUrl')

export const getGoogleAuthURL = () => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth'

  const options = {
    redirect_uri: `${SERVER_HOST_URL}/user-token/completeGoogleLogin`,
    client_id: GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  }

  return `${rootUrl}?${querystring.stringify(options)}`
}

export const getTokens = async ({
  code,
}: {
  code: string
}): Promise<{
  access_token: string
  expires_in: number
  refresh_token: string
  scope: string
  id_token: string
} | null> => {
  const url = 'https://oauth2.googleapis.com/token'
  const values = {
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: `${SERVER_HOST_URL}/user-token/completeGoogleLogin`, // Where Google console redirects user to after login
    grant_type: 'authorization_code',
  }

  try {
    const res = await axios.post(url, querystring.stringify(values), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    return res.data
  } catch (error) {
    console.error('Error occurred while getting tokens from Google', error)
    return null
  }
}
