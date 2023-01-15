import { oneOf, query, header } from 'express-validator'

export const completeGoogleLoginValidation = [
  query('code')
    .notEmpty()
    .isString()
    .withMessage('code is not valid or null/empty'),
]

export const fetchUserTokenValidation = [
  oneOf(
    [
      header('Authorization')
        .notEmpty()
        .withMessage('Authorization header is required'),
      query('email').notEmpty().withMessage('twitterUsername is required'),
      query('userTokenID').notEmpty().withMessage('userTokenID is required'),
    ],
    'Either email or userTokenID is mandatory'
  ),
]

export const fetchAllUserTokensValidation = [
  query('orderBy')
    .notEmpty()
    .isString()
    .isIn([
      'email',
      // 'totalRatingsCount',
      // 'latestRatingsCount',
    ])
    .withMessage('OrderBy cannot be empty and should be a valid string'),
]
