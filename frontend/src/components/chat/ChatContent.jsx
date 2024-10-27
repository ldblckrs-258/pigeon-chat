import { useEffect, useState, useRef } from 'react'
import { twMerge } from 'tailwind-merge'
import SpinLoader from '../SpinLoader'
import { useToast } from '../../hook/useToast'
import axios from 'axios'
import { useSocket } from '../../hook/useSocket'
import { useChat } from '../../hook/useChat'
import { useLightbox } from '../../hook/useLightbox'
import { PiTrashBold } from 'react-icons/pi'
import { AnimatePresence, motion } from 'framer-motion'
import DefaultImg from '../../assets/default.png'
import { trimFilename, byteToMb } from '../../utils/format'

const ChatContent = ({ className }) => {
	const toast = useToast()
	const { socket } = useSocket()
	const {
		messages: rawMessages,
		setMessages: setRawMessages,
		loading,
		setLoading,
		chatId,
		isGroup,
	} = useChat()
	const [messages, setMessages] = useState()
	const handleDeleteMessage = async (messageId) => {
		try {
			await axios.delete(`/api/messages/delete/${messageId}`)
			toast.success(
				'Message deleted',
				'Your message has been deleted',
				2000,
			)
		} catch (error) {
			console.log(error)
			toast.error('Delete message failed', 'Please try again later', 3000)
		}
	}

	useEffect(() => {
		let formatMessages = []
		for (let i = 0; i < rawMessages.length; i++) {
			const nextSender = rawMessages[i - 1]?.sender?._id
			const sender = rawMessages[i].sender?._id
			const prevSender = rawMessages[i + 1]?.sender?._id
			if (prevSender !== sender && sender === nextSender) {
				formatMessages.push({ ...rawMessages[i], position: 'start' })
			} else if (prevSender !== sender && sender !== nextSender) {
				formatMessages.push({ ...rawMessages[i], position: 'alone' })
			} else if (prevSender === sender && sender === nextSender) {
				formatMessages.push({ ...rawMessages[i], position: 'middle' })
			} else if (prevSender === sender && sender !== nextSender) {
				formatMessages.push({ ...rawMessages[i], position: 'end' })
			}
		}
		setMessages(formatMessages)
	}, [rawMessages])

	const container = useRef(null)

	// const loadMoreMessages = async () => {
	// 	if (!haveMore.current) return
	// 	skip.current += limit
	// 	setLoading(true)
	// 	try {
	// 		const res = await axios.get(
	// 			`/api/messages/get/${chatId}?limit=${limit}&skip=${skip.current}`,
	// 		)
	// 		const data = res.data?.data
	// 		console.log(data)
	// 		if (data.length === 0) {
	// 			haveMore.current = false
	// 			return
	// 		}
	// 		setMessages((prev) => [...prev, ...data])
	// 	} catch (error) {
	// 		console.log(error)
	// 	} finally {
	// 		setLoading(false)
	// 	}
	// }

	return (
		<div className={twMerge('relative gap-1', className)} ref={container}>
			{loading && !messages?.length && <SpinLoader className="m-auto" />}
			{!loading && !messages?.length && (
				<div className="m-auto text-3xl font-semibold text-gray-500">
					No messages yet
				</div>
			)}
			<AnimatePresence>
				{loading && messages?.length && (
					<motion.div
						className="absolute right-1/2 top-2 flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-gray-50 shadow-xl"
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.2 }}
					>
						<SpinLoader className="h-6 w-6" />
					</motion.div>
				)}
			</AnimatePresence>
			{!loading &&
				messages?.map((message) => {
					if (message.type === 'text')
						return (
							<TextMessage
								key={message._id}
								message={message}
								isGroup={isGroup}
								onDelete={handleDeleteMessage}
							/>
						)
					if (message.type === 'system')
						return (
							<SystemMessage
								key={message._id}
								message={message.content}
							/>
						)

					if (message.type === 'image' || message.type === 'emoji')
						return (
							<IEMessage
								key={message._id}
								message={message}
								isGroup={isGroup}
								onDelete={handleDeleteMessage}
							/>
						)

					if (message.type === 'fileTransfer')
						return (
							<FileTransferHistory
								key={message._id}
								message={message}
							/>
						)
				})}
		</div>
	)
}

const TextMessage = ({ message, isGroup, onDelete }) => {
	return (
		<div
			className={twMerge(
				'group flex w-full items-end gap-2',
				message.sender.isMine ? 'justify-end pr-3' : 'justify-start',
			)}
		>
			{!message.sender.isMine &&
			isGroup &&
			['end', 'alone'].includes(message?.position) ? (
				<img
					className="mb-1 h-7 w-7 rounded-full border border-gray-200 object-cover"
					src={message.sender.avatar}
					alt={`${message.sender.name} avatar`}
				/>
			) : (
				<div className="w-7" />
			)}

			<div className="relative flex max-w-[85%] flex-col justify-start gap-1">
				{isGroup &&
					!message.sender.isMine &&
					['start', 'alone'].includes(message?.position) && (
						<div className="mt-2 pl-2 text-xs">
							{message.sender?.name}
						</div>
					)}
				<div className="flex">
					<div
						className={twMerge(
							'rounded-[16px] px-3 py-2 text-sm',
							message.sender.isMine
								? 'bg-primary-400 text-white'
								: 'bg-gray-200 text-gray-800',
							message.position === 'start' &&
								(!message.sender.isMine
									? 'rounded-bl'
									: 'rounded-br'),
							message.position === 'middle' &&
								(!message.sender.isMine
									? 'rounded-l'
									: 'rounded-r'),
							message.position === 'end' &&
								(!message.sender.isMine
									? 'rounded-tl'
									: 'rounded-tr'),
						)}
						title={new Date(message.createdAt).toLocaleString()}
					>
						{message.content}
					</div>
				</div>

				<button
					className={`absolute -left-7 bottom-2 hidden h-5 w-5 items-center justify-center rounded-full text-gray-500 hover:text-secondary-500 ${message.sender.isMine ? 'group-hover:flex' : ''}`}
					onClick={() => onDelete(message._id)}
				>
					<PiTrashBold />
				</button>
			</div>
		</div>
	)
}

const SystemMessage = ({ message }) => {
	return (
		<div className="flex w-full justify-center py-1 text-sm text-gray-400">
			{message}
		</div>
	)
}

const IEMessage = ({ message, isGroup, onDelete }) => {
	const { openLightbox } = useLightbox()
	const [loading, setLoading] = useState(true)

	return (
		<div
			className={twMerge(
				'group flex w-full items-end gap-2',
				message.sender.isMine ? 'justify-end pr-3' : 'justify-start',
			)}
		>
			{!message.sender.isMine &&
			(message.position === 'end' || message.position === 'alone') ? (
				<img
					className="mb-1 h-7 w-7 rounded-full border border-gray-200 object-cover"
					src={message.sender.avatar}
					alt={`${message.sender.name} avatar`}
				/>
			) : (
				<div className="w-7" />
			)}

			<div className="relative flex max-w-[85%] flex-col justify-start gap-1">
				{isGroup &&
					!message.sender.isMine &&
					(message.position === 'start' ||
						message.position === 'alone') && (
						<div className="pl-2 text-xs">
							{message.sender.name}
						</div>
					)}
				<div
					className="text-3xl"
					title={new Date(message.createdAt).toLocaleString()}
				>
					{message.type === 'image' ? (
						<div className="h-[200px] overflow-hidden rounded-lg border border-gray-200">
							<img
								className="h-full cursor-pointer object-cover"
								src={message.content}
								alt={`${message._id}-image`}
								onClick={() => openLightbox(message.content)}
								onLoad={() => setLoading(false)}
								onError={(e) => {
									e.target.src = DefaultImg
									setLoading(false)
								}}
							/>
							{loading && <SpinLoader className="m-auto" />}
						</div>
					) : (
						message.content
					)}
				</div>
				<button
					className={`absolute -left-5 hidden h-5 w-5 items-center justify-center rounded-full text-gray-500 hover:text-secondary-500 ${message.type === 'image' ? 'bottom-[100px]' : 'bottom-2'} ${message.sender.isMine ? 'group-hover:flex' : ''}`}
					onClick={() => onDelete(message._id)}
				>
					<PiTrashBold />
				</button>
			</div>
		</div>
	)
}

const FileTransferHistory = ({ message }) => {
	return (
		<div
			className={twMerge(
				'group flex w-full items-end gap-2',
				message.sender.isMine ? 'justify-end pr-3' : 'justify-start',
			)}
		>
			<div className="w-7" />

			<div
				className="flex max-w-[85%] flex-col justify-start gap-1 rounded-lg border border-gray-300 bg-slate-50 px-6 py-3"
				title={new Date(message.createdAt).toLocaleString()}
			>
				<div className="flex items-center gap-2 text-sm">
					<span className="font-semibold">File name:</span>
					<span>{trimFilename(message.content, 25)}</span>
				</div>
				<div className="flex items-center gap-2 text-sm">
					<span className="font-semibold">File size:</span>
					<span>{byteToMb(message?.size || 0)} MB</span>
				</div>
				<div className="flex items-center gap-2 text-sm">
					<span className="font-semibold">Start at:</span>
					<span>{new Date(message.createdAt).toLocaleString()}</span>
				</div>
				<div className="flex items-center gap-2 text-sm">
					<span className="font-semibold">Status:</span>
					<span
						className={`first-letter:uppercase ${message?.status === 'completed' && 'text-green-600'} ${message?.status === 'cancelled' && 'text-rose-600'}`}
					>
						{message?.status}
					</span>
				</div>
			</div>
		</div>
	)
}

export default ChatContent
