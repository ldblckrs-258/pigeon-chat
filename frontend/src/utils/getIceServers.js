import axios from 'axios'
import { iceServers } from '../configs/iceServers'

export const meteredIceServers = async () => {
	try {
		const response = await axios.get(
			`${import.meta.env.VITE_METERED_URI}/api/v1/turn/credentials?apiKey=${import.meta.env.VITE_METERED_API_KEY}`,
		)
		return response.data
	} catch (error) {
		console.error(error)
		return []
	}
}

export const cloudflareIceServers = async () => {
	try {
		let stun = { urls: 'stun:stun.cloudflare.com:3478' }
		let turn = { urls: 'turn:turn.speed.cloudflare.com:50000' }
		const response = await axios.get(
			'https://speed.cloudflare.com/turn-creds',
		)
		const { username, credential } = response.data
		return [{ ...stun }, { ...turn, username, credential }]
	} catch (error) {
		console.error(error)
		return []
	}
}

export const allIceServers = async () => {
	const metered = await meteredIceServers()
	const cloudflare = await cloudflareIceServers()
	return [...iceServers, ...cloudflare, ...metered]
}
