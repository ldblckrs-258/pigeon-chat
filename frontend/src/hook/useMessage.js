import axios from 'axios'
import { useSocket } from './useSocket'
import { useToast } from './useToast'

export const useMessage = () => {
	const { sendMsg } = useSocket()
	const toast = useToast()

	const isEmoji = (str) => {
		const regex =
			/[\p{Emoji_Presentation}\p{Emoji}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}]+/u
		const isNumber = /^\d+$/.test(str)
		return regex.test(str) && str.length === 2 && !isNumber
	}

	const sendAnyMessage = async (content, type, chatId) => {
		if (!content || content === '') return
		try {
			await axios.post(
				`${import.meta.env.VITE_SERVER_URI}/messages/send`,
				{
					chatId,
					content,
					type,
				},
			)
			return true
		} catch (error) {
			console.error(error)
			toast.error(
				'Failed to send message',
				'Please try again later',
				4000,
			)
		}
	}

	const sendAMessage = async (message, chatId, chatMembers) => {
		const memberIds = chatMembers.map((member) => member._id)
		if (!message || message === '') return
		let isSend = false
		if (isEmoji(message)) {
			isSend = await sendAnyMessage(message, 'emoji', chatId, memberIds)
		} else if (
			message.startsWith('http') &&
			(message.endsWith('.png') ||
				message.endsWith('.jpg') ||
				message.endsWith('.jpeg'))
		) {
			isSend = await sendAnyMessage(message, 'image', chatId, memberIds)
		} else {
			isSend = await sendAnyMessage(message, 'text', chatId, memberIds)
		}
		if (isSend) {
			sendMsg(chatId, memberIds)
		}
	}

	const sendThumbUp = async (chatId, chatMembers) => {
		const isSend = await sendAnyMessage('👍', 'emoji', chatId)
		if (isSend) {
			sendMsg(
				chatId,
				chatMembers.map((member) => member._id),
			)
		}
	}

	const uploadImage = async (file) => {
		toast.info('Uploading image', 'Please wait a moment', 5000)
		console.log(file)
		try {
			const formData = new FormData()
			formData.append('image', file)
			const res = await axios.post(
				`${import.meta.env.VITE_SERVER_URI}/tools/upload/image`,
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				},
			)
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

	return {
		sendAMessage,
		sendThumbUp,
		uploadImage,
	}
}
