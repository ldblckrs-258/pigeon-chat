import App from './src/app.js'
import BodyParser from './src/utils/body-parser.js'
import homeRoute from './src/routes/homeRoute.js'
import authRoute from './src/routes/authRoute.js'
import { connectDb } from './src/utils/mongodb.js'
import { config } from 'dotenv'
config()

const app = App()
connectDb()

app.useRouter('/home', homeRoute)
app.useRouter('/auth', authRoute)
app.useAll(BodyParser)
app.get('/check', (req, res, next) => {
  res.status(200).json({ message: 'Server is running' })
})

const start = async () => {
  app.run(3000)
}

start()
