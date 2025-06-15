import axios from 'axios'
import { createContext, useEffect, useState } from 'react'
import { useAuth } from '../hook/useAuth'
import { useSocket } from '../hook/useSocket'
import { useToast } from '../hook/useToast'
export const ChatContext = createContext()

const LIMIT = 15
export const ChatContextProvider = ({ children }) => {
	const { socket } = useSocket()
	const { user } = useAuth()
	const toast = useToast()
	const [loading, setLoading] = useState(false)
	const [chatsLoading, setChatsLoading] = useState(false)
	const [currentChatId, setCurrentChatId] = useState(null)
	const [currentChat, setCurrentChat] = useState(null)
	const [chats, setChats] = useState([])
	const [searchValue, setSearchValue] = useState('')
	const [unread, setUnread] = useState(0)
	const [messages, setMessages] = useState([])
	const [haveMore, setHaveMore] = useState(true)
	const [friendRequests, setFriendRequests] = useState([])

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

	const getChats = async (isFirstLoad = false) => {
		if (isFirstLoad) setChatsLoading(true)
		try {
			const res = await axios.get('/api/chats/all', {
				params: { ...(searchValue && { search: searchValue }) },
			})
			let data = res.data.data
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
		} finally {
			setChatsLoading(false)
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

	const getFriendRequests = async () => {
		try {
			const res = await axios.get('/api/friendships/requests')
			setFriendRequests(res.data.data)
		} catch (error) {
			console.error(error)
		}
	}

	useEffect(() => {
		if (!user || !user?.id) return
		getChats(true)
		getFriendRequests()
	}, [user])

	useEffect(() => {
		getChats()
	}, [searchValue])

	useEffect(() => {
		if (!user || !user?.id) {
			setChats([])
			setCurrentChat(null)
			setCurrentChatId(null)
			setMessages([])
			setUnread(0)
		}
	}, [user])

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
		socket.on('friendRequest', (name) => {
			toast.info(
				'New friend request',
				`${name} sent you a friend request`,
				5000,
			)
			getFriendRequests()
		})
		socket.on('friendRequestAccepted', (name) => {
			toast.success(
				'Friend request accepted',
				`You and ${name} are now friends`,
				5000,
			)
			getFriendRequests()
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
				chatsLoading,
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
				friendRequests,
				setFriendRequests,
			}}
		>
			{children}
		</ChatContext.Provider>
	)
}
