import { getHome, postHome } from '../controllers/homeController.js'
import { userMiddleware } from '../middlewares/userMiddleware.js'
import Router from '../src/router.js'

const router = Router()

const homeRoute = (app) => {
  router.get('/get', getHome)
  router.use('/get', userMiddleware)

  router.post('/post', postHome)

  app.useRouter('/api', router)
}

export default homeRoute
