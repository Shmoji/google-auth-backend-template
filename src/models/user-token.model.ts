/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

export interface IUserToken {
  googleUserID: string
  email: string
  googleProfilePic: string
}

interface IUserTokenModel extends mongoose.Model<UserTokenDocument> {
  build(attr: IUserToken): UserTokenDocument
}

interface UserTokenDocument extends mongoose.Document {
  googleUserID: string
  email: string
  googleProfilePic: string
}

const UserTokenSchema = new mongoose.Schema(
  {
    googleUserID: { type: String, required: true },
    email: { type: String, required: true },
    googleProfilePic: { type: String, required: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

UserTokenSchema.statics.build = (attr: IUserToken) => {
  return new UserTokenModel(attr)
}

const UserTokenModel = mongoose.model<UserTokenDocument, IUserTokenModel>(
  'UserToken',
  UserTokenSchema
)

export { UserTokenModel, UserTokenDocument }
