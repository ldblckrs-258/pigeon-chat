require("dotenv").config()

const freeIceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun.l.google.com:5349" },
  { urls: "stun:freestun.net:3478" },
  { urls: "turn:freestun.net:3478", username: "free", credential: "free" },
]

const meteredIceServers = async () => {
  try {
    const response = await fetch(
      `${process.env.METERED_URI}/api/v1/turn/credentials?apiKey=${process.env.METERED_API_KEY}`
    )
    const data = await response.json()
    return data
  } catch (error) {
    console.error(error)
    return []
  }
}

const cloudflareIceServers = async () => {
  try {
    let stun = { urls: "stun:stun.cloudflare.com:3478" }
    let turn = { urls: "turn:turn.speed.cloudflare.com:50000" }
    const response = await fetch("https://speed.cloudflare.com/turn-creds")
    const { username, credential } = await response.json()
    return [{ ...stun }, { ...turn, username, credential }]
  } catch (error) {
    console.error(error)
    return []
  }
}

const allIceServers = async () => {
  const metered = await meteredIceServers()
  const cloudflare = await cloudflareIceServers()
  return [...freeIceServers, ...cloudflare, ...metered]
}

module.exports = {
  freeIceServers,
  meteredIceServers,
  cloudflareIceServers,
  allIceServers,
}
