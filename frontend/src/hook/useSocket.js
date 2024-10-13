import { SocketContext } from '../contexts/SocketContext'
import { useContext } from 'react'

export const useSocket = () => {
	const { socket, onlineUsers, lastUpdate } = useContext(SocketContext)

	const sendMsg = (chatId, memberIds) => {
		socket.emit('sendMsg', chatId, memberIds)
	}

	const updateChat = (chatId, memberIds) => {
		socket.emit('updateChat', chatId, memberIds)
	}

	return {
		socket,
		onlineUsers,
		lastUpdate,
		updateChat,
		sendMsg,
	}
}
