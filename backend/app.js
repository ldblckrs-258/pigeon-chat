const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const path = require('path')
require('dotenv').config()

const { serverInfo } = require('./utils/network.util')

const app = express()
app.use(require('./middlewares/morgan.middleware'))
app.use(cookieParser())
app.use(express.json())
app.use(
  cors({
    origin: process.env.ORIGIN || 'http://localhost:3000',
  })
)

app.get('/', serverInfo)
app.use(require('./routes'))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

module.exports = app
