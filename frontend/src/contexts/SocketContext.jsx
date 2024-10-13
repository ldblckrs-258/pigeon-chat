import { createContext, useEffect, useState } from 'react'
import { useAuth } from '../hook/useAuth'
import io from 'socket.io-client'
import { useNotification } from '../hook/useNotification'

export const SocketContext = createContext()

export const SocketContextProvider = ({ children }) => {
	const [socket, setSocket] = useState(null)
	const [onlineUsers, setOnlineUsers] = useState([])
	const [lastUpdate, setLastUpdate] = useState(null)
	const { user } = useAuth()
	const { titleNotify } = useNotification()

	useEffect(() => {
		const serverUrl = import.meta.env.VITE_SERVER_URL
		const serverPort = import.meta.env.VITE_SERVER_PORT

		if (!serverUrl && !serverPort) {
			console.error(
				'VITE_SERVER_URL and VITE_SERVER_PORT must be defined',
				serverUrl,
				serverPort,
			)
		}
		if (user) {
			const newSocket = io(`${serverUrl}:${serverPort}`)
			setSocket(newSocket)
			return () => newSocket.disconnect()
		}
	}, [user])

	useEffect(() => {
		if (!socket) return
		socket.emit('online', user.id)
		socket.on('getOnlineUsers', (users) => {
			setOnlineUsers(users)
		})
		socket.on('updated', (type, time, chatId) => {
			setLastUpdate({ type, time, chatId })
			if (type === 'message') titleNotify('You have new message!')
		})

		return () => {
			socket.off('getOnlineUsers')
			socket.off('updated')
		}
	}, [socket])

	return (
		<SocketContext.Provider
			value={{ socket, setSocket, onlineUsers, lastUpdate }}
		>
			{children}
		</SocketContext.Provider>
	)
}
