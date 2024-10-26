import { SocketContext } from '../contexts/SocketContext'
import { useContext } from 'react'

export const useSocket = () => {
	const { socket, onlineUsers } = useContext(SocketContext)

	return {
		socket,
		onlineUsers,
	}
}
