var express = require("express")
const morgan = require("morgan")
const http = require("http")
const mongoose = require("mongoose")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const webSocket = require("./Socket/index")
require("dotenv").config()

const { getTime } = require("./utils/Time")
const { serverInfo } = require("./Utils/Network")

var app = express()
app.use(cookieParser())

const port = process.env.PORT || 3001
const origin = process.env.ORIGIN || "http://localhost:3000"

morgan.token("preciseTime", getTime)

app.use(
  morgan(
    ":preciseTime :method :url :status :response-time ms from :remote-addr"
  )
)

app.use(express.json())
app.use(
  cors({
    origin: origin,
  })
)

// > Routes

app.get("/", serverInfo)

app.use("/users", require("./Routes/userRoute"))
app.use("/auth", require("./Routes/authRoute"))
app.use("/chats", require("./Routes/chatRoute"))
app.use("/messages", require("./Routes/messageRoute"))
app.use("/tools", require("./Routes/toolRoute"))

// > End of Routes

const server = http.createServer(app)

server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

server.on("error", (err) => {
  console.error(err)
})

mongoose
  .connect(process.env.ATLAS_URI)
  .then(() => {
    console.log("Connected to MongoDB\n")
  })
  .catch((err) => {
    console.error(err)
  })

// > Socket.io

webSocket.init(server)
