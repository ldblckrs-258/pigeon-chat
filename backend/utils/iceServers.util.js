require('dotenv').config()

const freeIceServers = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun.l.google.com:5349' },
  { urls: 'stun:freestun.net:3478' },
  { urls: 'turn:freestun.net:3478', username: 'free', credential: 'free' },
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
    let stun = { urls: 'stun:stun.cloudflare.com:3478' }
    let turn = { urls: 'turn:turn.speed.cloudflare.com:50000' }
    const response = await fetch('https://speed.cloudflare.com/turn-creds')
    const { username, credential } = await response.json()
    return [{ ...stun }, { ...turn, username, credential }]
  } catch (error) {
    console.error(error)
    return []
  }
}

const privateCloudflareIceServers = async () => {
  try {
    const response = await fetch(
      `https://rtc.live.cloudflare.com/v1/turn/keys/${process.env.CLOUDFLARE_TURN_TOKEN}/credentials/generate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ttl: 86400,
        }),
      }
    )
    const data = await response.json()
    return data.iceServers
  } catch (error) {
    console.error(error)
    return []
  }
}

const allIceServers = async () => {
  const metered = await meteredIceServers()
  const cloudflare = await cloudflareIceServers()
  const private = await privateCloudflareIceServers()
  return [...private, ...cloudflare, ...metered]
}

module.exports = {
  freeIceServers,
  meteredIceServers,
  cloudflareIceServers,
  privateCloudflareIceServers,
  allIceServers,
}
