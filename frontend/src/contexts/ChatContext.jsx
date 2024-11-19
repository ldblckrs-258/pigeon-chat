import { createContext, useEffect, useState } from 'react'
import axios from 'axios'
import { useSocket } from '../hook/useSocket'
import { useAuth } from '../hook/useAuth'
export const ChatContext = createContext()

const LIMIT = 15
export const ChatContextProvider = ({ children }) => {
	const { socket } = useSocket()
	const { user } = useAuth()
	const [loading, setLoading] = useState(false)
	const [currentChatId, setCurrentChatId] = useState(null)
	const [currentChat, setCurrentChat] = useState(null)
	const [chats, setChats] = useState([])
	const [searchValue, setSearchValue] = useState('')
	const [unread, setUnread] = useState(0)
	const [messages, setMessages] = useState([])
	const [haveMore, setHaveMore] = useState(true)

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
			setHaveMore(res.data.haveMore)
		} catch (error) {
			console.log(error)
		} finally {
			setLoading(false)
		}
	}

	const loadMoreMessages = async () => {
		setLoading(true)
		try {
			const res = await axios.get(
				`/api/messages/get/${currentChatId}?limit=${LIMIT}&skip=${messages.length}`,
			)
			const data = res.data?.data
			if (data.length === 0) return
			setMessages((prev) => [...prev, ...data])
			setHaveMore(res.data.haveMore)
		} catch (error) {
			console.log(error)
		} finally {
			setLoading(false)
		}
	}

	const getChats = async () => {
		try {
			const res = await axios.get('/api/chats/all', {
				params: { ...(searchValue && { search: searchValue }) },
			})
			let data = res.data
			if (currentChatId) {
				data = data.map((chat) => {
					if (chat._id === currentChatId) {
						chat.read = true
					}
					return chat
				})
			}
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
	}, [searchValue, user])

	useEffect(() => {
		if (!currentChatId) return
		setMessages([])
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
		socket.on('deleteMessage', (chatId, messageId) => {
			if (chatId === currentChatId) {
				setMessages((prev) =>
					prev.filter((msg) => msg._id !== messageId),
				)
			}
		})
		return () => {
			socket.off('newMessage')
			socket.off('updateChat')
			socket.off('joinChat')
			socket.off('outChat')
			socket.off('deleteMessage')
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
				haveMore,
				setMessages,
				getMessages,
				loadMoreMessages,
				getChats,
				openChat,
				clearCurrent,
				getCurrentChat,
			}}
		>
			{children}
		</ChatContext.Provider>
	)
}
