const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
require("dotenv").config()

const { serverInfo } = require("./utils/network.util")

const app = express()
app.use(require("./middlewares/morgan.middleware"))
app.use(cookieParser())
app.use(express.json())
app.use(
  cors({
    origin: process.env.ORIGIN || "http://localhost:3000",
    credentials: true,
  })
)

app.get("/", serverInfo)
app.use(require("./routes"))

module.exports = app
