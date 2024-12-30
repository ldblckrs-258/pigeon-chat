import { useContext } from 'react'
import axios from 'axios'
import { useToast } from './useToast'
import { ChatContext } from '../contexts/ChatContext'
export const useChat = () => {
	const {
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
	} = useContext(ChatContext)
	const toast = useToast()

	const isEmoji = (str) => {
		const regex =
			/[\p{Emoji_Presentation}\p{Emoji}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}]+/u
		const isNumber = /^\d+$/.test(str)
		return regex.test(str) && str.length === 2 && !isNumber
	}

	const sendAnyMessage = async (content, type) => {
		if (!content || content === '') return
		try {
			const res = await axios.post('/api/messages/send', {
				chatId: currentChatId,
				content,
				type,
			})
			setMessages((prev) => [res.data.message, ...prev])
			getChats()
		} catch (error) {
			console.error(error)
			toast.error(
				'Failed to send message',
				'Please try again later',
				4000,
			)
		}
	}

	const sendAMessage = async (message) => {
		if (!message || message === '') return
		if (isEmoji(message)) {
			await sendAnyMessage(message, 'emoji')
		} else if (
			message.startsWith('http') &&
			(message.endsWith('.png') ||
				message.endsWith('.jpg') ||
				message.endsWith('.jpeg'))
		) {
			await sendAnyMessage(message, 'image')
		} else {
			await sendAnyMessage(message, 'text')
		}
	}

	const sendThumbUp = async () => {
		await sendAnyMessage('👍', 'emoji')
	}

	const uploadImage = async (file) => {
		toast.info('Uploading image', 'Please wait a moment', 5000)
		try {
			const formData = new FormData()
			formData.append('image', file)
			const res = await axios.post('/api/tools/upload/image', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			})
			return res.data.url
		} catch (error) {
			console.error(error)
			toast.error(
				'Failed to upload image',
				'Please try again later',
				4000,
			)
		}
	}

	const isGroup = currentChat?.members?.length > 2

	return {
		loading,
		setLoading,
		currentChatId,
		setCurrentChatId,
		currentChat,
		setCurrentChat,
		isGroup,
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
		sendAMessage,
		sendThumbUp,
		uploadImage,
		clearCurrent,
		getCurrentChat,
		friendRequests,
		setFriendRequests,
	}
}
