import express from 'express'

import {
  completeGoogleLogin,
  fetchAllGoogleUserTokens,
  fetchGoogleUserToken,
  initiateGoogleLogin,
} from '../controllers/user-token.controller'
import { optionalAuthenticateAndSetAccount } from '../middleware/authentication'
import { validateRequest } from '../middleware/validateRequest'
import {
  completeGoogleLoginValidation,
  fetchAllUserTokensValidation,
  fetchUserTokenValidation,
} from '../validations/user-token.validation'

export const userTokenRouter = express.Router()

userTokenRouter.post(
  '/initiateGoogleLogin',
  validateRequest,
  initiateGoogleLogin
)

// Only called by redirection from Google
userTokenRouter.get(
  '/completeGoogleLogin',
  completeGoogleLoginValidation,
  validateRequest,
  completeGoogleLogin
)

userTokenRouter.get(
  '/single',
  fetchUserTokenValidation,
  validateRequest,
  optionalAuthenticateAndSetAccount,
  fetchGoogleUserToken
)

userTokenRouter.get(
  '',
  fetchAllUserTokensValidation,
  validateRequest,
  fetchAllGoogleUserTokens
)
