import App from './src/app.js'
import BodyParser from './utils/body-parser.js'
import homeRoute from './routes/homeRoute.js'
const app = App()

homeRoute(app)
app.useAll(BodyParser)
app.get('/check', (req, res, next) => {
  res.status(200).json({ message: 'Server is running' })
})

const start = async () => {
  app.run(3000)
}

start()
