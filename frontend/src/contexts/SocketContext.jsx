import { createContext, useEffect, useState } from 'react'
import { useAuth } from '../hook/useAuth'
import io from 'socket.io-client'

export const SocketContext = createContext()

export const SocketContextProvider = ({ children }) => {
	const [socket, setSocket] = useState(null)
	const [onlineUsers, setOnlineUsers] = useState([])
	const { user } = useAuth()

	useEffect(() => {
		const serverURI = import.meta.env.VITE_SERVER_URI

		if (!serverURI) {
			console.error('VITE_SERVER_URI must be defined')
		}
		if (user) {
			const newSocket = io(`${serverURI}`)
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

		return () => {
			socket.off('getOnlineUsers')
		}
	}, [socket])

	return (
		<SocketContext.Provider value={{ socket, setSocket, onlineUsers }}>
			{children}
		</SocketContext.Provider>
	)
}
