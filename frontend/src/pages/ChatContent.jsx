import { useEffect, useState, useRef } from 'react'
import { twMerge } from 'tailwind-merge'
import SpinLoader from '../components/SpinLoader'
import { useToast } from '../hook/useToast'
import axios from 'axios'
import { useSocket } from '../hook/useSocket'
import { useLightbox } from '../hook/useLightbox'
import { PiTrashBold } from 'react-icons/pi'
import { AnimatePresence, motion } from 'framer-motion'
import DefaultImg from '../assets/default.png'

const ChatContent = ({ className, chatId, onDeleted, isGroup }) => {
	const [messages, setMessages] = useState([])
	const skip = useRef(0)
	const haveMore = useRef(true)
	const limit = 20
	const [loading, setLoading] = useState(false)
	const toast = useToast()
	const { lastUpdate } = useSocket()

	const handleDeleteMessage = async (messageId) => {
		try {
			await axios.delete(`/api/messages/delete/${messageId}`)
			toast.success(
				'Message deleted',
				'Your message has been deleted',
				2000,
			)
			onDeleted()
		} catch (error) {
			console.log(error)
			toast.error('Delete message failed', 'Please try again later', 3000)
		}
	}

	const container = useRef(null)

	const getMessages = async () => {
		setLoading(true)
		try {
			const res = await axios.get(
				`/api/messages/get/${chatId}?limit=${limit}`,
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

	const loadMoreMessages = async () => {
		if (!haveMore.current) return
		skip.current += limit
		setLoading(true)
		try {
			const res = await axios.get(
				`/api/messages/get/${chatId}?limit=${limit}&skip=${skip.current}`,
			)
			const data = res.data?.data
			console.log(data)
			if (data.length === 0) {
				haveMore.current = false
				return
			}
			setMessages((prev) => [...prev, ...data])
		} catch (error) {
			console.log(error)
		} finally {
			setLoading(false)
		}
	}

	const getNewMessages = async () => {
		try {
			const res = await axios.get(
				`/api/messages/getNew/${chatId}?lastMessageId=${messages[0]._id}`,
			)
			const data = res.data?.data
			if (data.length === 0) return
			setMessages((prev) => [...data, ...prev])
		} catch (error) {
			console.log(error)
		}
	}

	const handleScroll = (e) => {
		if (e.target.scrollTop === 0) loadMoreMessages()
	}

	useEffect(() => {
		skip.current = 0
		haveMore.current = true
		getMessages()
	}, [chatId])

	useEffect(() => {
		if (lastUpdate) {
			if (messages.length === 0) getMessages()
			getNewMessages()
		}
	}, [lastUpdate])

	useEffect(() => {
		container.current?.addEventListener('scroll', handleScroll)
		return () => {
			container.current?.removeEventListener('scroll', handleScroll)
		}
	}, [container.current])

	return (
		<div className={twMerge('relative gap-1', className)} ref={container}>
			{loading && messages.length === 0 && (
				<SpinLoader className="m-auto" />
			)}
			{!loading && messages.length === 0 && (
				<div className="m-auto text-3xl font-semibold text-gray-500">
					No messages yet
				</div>
			)}
			<AnimatePresence>
				{loading && messages.length > 0 && (
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
				messages.map((message) => {
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
								onDelete={handleDeleteMessage}
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
				})}
		</div>
	)
}

const TextMessage = ({ message, isGroup, onDelete }) => {
	const [isHover, setIsHover] = useState(false)
	return (
		<div
			className={twMerge(
				'flex w-full items-end gap-2',
				message.sender.isMine ? 'justify-end pr-3' : 'justify-start',
			)}
			onMouseOver={() => setIsHover(true)}
			onMouseLeave={() => setIsHover(false)}
		>
			{!message.sender.isMine &&
			(message.position === 'end' || message.position === 'alone') ? (
				<img
					className="mb-2 h-7 w-7 rounded-full border border-gray-200 object-cover"
					src={message.sender.avatar}
					alt={`${message.sender.name} avatar`}
				/>
			) : (
				<div className="w-7" />
			)}

			<div
				className={twMerge(
					'relative flex max-w-[85%] flex-col justify-start gap-1',
					message.position === 'end' && 'mb-2',
				)}
			>
				{isGroup &&
					!message.sender.isMine &&
					(message.position === 'start' ||
						message.position === 'alone') && (
						<div className="pl-2 text-xs">
							{message.sender.name}
						</div>
					)}
				<div
					className={twMerge(
						'rounded-[16px] px-3 py-2 text-sm',
						message.sender.isMine
							? 'bg-primary-400 text-white'
							: 'bg-gray-200 text-gray-800',
						message.position === 'end' &&
							(message.sender.isMine
								? 'rounded-tr'
								: 'rounded-tl'),
						message.position === 'middle' &&
							(message.sender.isMine ? 'rounded-r' : 'rounded-l'),
						message.position === 'start' &&
							(message.sender.isMine
								? 'rounded-br'
								: 'rounded-bl'),
					)}
					title={new Date(message.createdAt).toLocaleString()}
				>
					{message.content}
				</div>
				{isHover && message.sender.isMine && (
					<button
						className={`absolute -left-7 bottom-2 flex h-5 w-5 items-center justify-center rounded-full text-gray-500 hover:text-secondary-500`}
						onClick={() => onDelete(message._id)}
					>
						<PiTrashBold />
					</button>
				)}
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
	const [isHover, setIsHover] = useState(false)

	return (
		<div
			className={twMerge(
				'flex w-full items-end gap-2',
				message.sender.isMine ? 'justify-end pr-3' : 'justify-start',
			)}
			onMouseOver={() => setIsHover(true)}
			onMouseLeave={() => setIsHover(false)}
		>
			{!message.sender.isMine &&
			(message.position === 'end' || message.position === 'alone') ? (
				<img
					className="mb-2 h-7 w-7 rounded-full border border-gray-200 object-cover"
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
					className={twMerge('mb-2 text-3xl')}
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
				{isHover && message.sender.isMine && (
					<button
						className={`absolute -left-7 flex h-5 w-5 items-center justify-center rounded-full text-gray-500 hover:text-secondary-500 ${message.type === 'image' ? 'bottom-[100px]' : 'bottom-4'}`}
						onClick={() => onDelete(message._id)}
					>
						<PiTrashBold />
					</button>
				)}
			</div>
		</div>
	)
}

export default ChatContent
