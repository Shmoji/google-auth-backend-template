import { Router } from 'express'

import { userTokenRouter } from './user-token'

const routes = Router()

// Routers
routes.use('/user-token', userTokenRouter)

export { routes }
