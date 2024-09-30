import { createContext, useEffect, useState } from 'react'
import { useAuth } from '../hook/useAuth'
import { useNotification } from '../hook/useNotification'
import io from 'socket.io-client'

export const SocketContext = createContext()

export const SocketContextProvider = ({ children }) => {
	const [socket, setSocket] = useState(null)
	const [onlineUsers, setOnlineUsers] = useState([])
	const [lastUpdate, setLastUpdate] = useState(null)
	const { user } = useAuth()
	const { titleNotify } = useNotification()

	useEffect(() => {
		if (user) {
			const newSocket = io('http://localhost:3000')
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
	}, [socket])

	return (
		<SocketContext.Provider
			value={{ socket, setSocket, onlineUsers, lastUpdate }}
		>
			{children}
		</SocketContext.Provider>
	)
}
