import { createContext, useEffect, useState } from 'react'
import axios from 'axios'
import { useSocket } from '../hook/useSocket'
export const ChatContext = createContext()

const LIMIT = 50
export const ChatContextProvider = ({ children }) => {
	const { socket } = useSocket()
	const [loading, setLoading] = useState(false)
	const [currentChatId, setCurrentChatId] = useState(null)
	const [currentChat, setCurrentChat] = useState(null)
	const [chats, setChats] = useState([])
	const [searchValue, setSearchValue] = useState('')
	const [unread, setUnread] = useState(0)
	const [messages, setMessages] = useState([])

	const getCurrentChat = async () => {
		if (!currentChatId) return
		try {
			const res = await axios.get(`/api/chats/get/${currentChatId}`)
			setCurrentChat(res.data.data)
		} catch (error) {
			console.error(error)
		}
	}

	const getMessages = async () => {
		setLoading(true)
		try {
			const res = await axios.get(
				`/api/messages/get/${currentChatId}?limit=${LIMIT}`,
			)
			const data = res.data?.data
			if (data.length === 0) return
			setMessages(data)
		} catch (error) {
			console.log(error)
		} finally {
			setLoading(false)
		}
	}

	const getChats = async () => {
		setMessages([])
		try {
			const res = await axios.get('/api/chats/all', {
				params: { ...(searchValue && { search: searchValue }) },
			})
			const data = res.data
			setChats(data)
			setUnread(data.filter((chat) => !chat.read).length)
		} catch (error) {
			console.error(error)
		}
	}

	const openChat = (id) => {
		setChats((prev) =>
			prev.map((chat) => {
				if (chat._id === id && chat.read === false) {
					chat.read = true
					setUnread((prev) => prev - 1)
				}
				return chat
			}),
		)
		setCurrentChatId(id)
	}

	const clearCurrent = () => {
		setCurrentChat(null)
		setCurrentChatId(null)
		setMessages([])
		getChats()
	}

	useEffect(() => {
		getChats()
	}, [searchValue])

	useEffect(() => {
		if (!currentChatId) return
		getCurrentChat()
		getMessages()
	}, [currentChatId])

	useEffect(() => {
		if (!socket) return
		socket.on('newMessage', (data) => {
			if (data?.chatId === currentChatId) {
				setMessages((prev) => [data, ...prev])
			}
			getChats()
		})
		socket.on('updateChat', (chatId) => {
			if (chatId === currentChatId) {
				getCurrentChat()
			}
		})
		socket.on('joinChat', () => {
			getChats()
		})
		socket.on('outChat', (chatId) => {
			if (chatId === currentChatId) {
				clearCurrent()
			}
			getChats()
		})
		return () => {
			socket.off('newMessage')
			socket.off('updateChat')
			socket.off('joinChat')
			socket.off('outChat')
		}
	}, [socket, currentChatId])

	return (
		<ChatContext.Provider
			value={{
				loading,
				setLoading,
				currentChatId,
				setCurrentChatId,
				currentChat,
				setCurrentChat,
				chats,
				setChats,
				searchValue,
				setSearchValue,
				unread,
				setUnread,
				messages,
				setMessages,
				getMessages,
				getChats,
				openChat,
				clearCurrent,
			}}
		>
			{children}
		</ChatContext.Provider>
	)
}
