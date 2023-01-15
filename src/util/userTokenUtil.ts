import type { UserTokenDocument } from '../models/user-token.model'
import type { UserTokenResponse } from '../types/user-token.types'

export function mapUserTokenResponse(
  userTokenDoc: UserTokenDocument | null
): UserTokenResponse | null {
  if (!userTokenDoc) {
    return null
  }

  return {
    id: userTokenDoc._id.toString(),
    googleUserID: userTokenDoc.googleUserID,
    email: userTokenDoc.email,
    googleProfilePic: userTokenDoc.googleProfilePic,
  }
}
