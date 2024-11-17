import { useEffect, useState, useRef } from 'react'
import { twMerge } from 'tailwind-merge'
import SpinLoader from '../SpinLoader'
import { useToast } from '../../hook/useToast'
import axios from 'axios'
import { useChat } from '../../hook/useChat'
import { useLightbox } from '../../hook/useLightbox'
import { PiArrowsLeftRightBold, PiDot, PiTrashBold } from 'react-icons/pi'
import { AnimatePresence, motion } from 'framer-motion'
import InfiniteScroll from 'react-infinite-scroll-component'
import DefaultImg from '../../assets/default.png'
import { trimFilename, byteToMb } from '../../utils/format'
import FileIcon from '../FileIcon'
const ChatContent = ({ className }) => {
	const toast = useToast()
	const {
		messages: rawMessages,
		haveMore,
		loadMoreMessages,
		loading,
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

	useEffect(() => {
		console.log('messages', messages?.length)
		console.log('has more', haveMore)
	}, [messages])

	return (
		<>
			<AnimatePresence>
				{messages?.length && loading && (
					<motion.div
						className="absolute right-1/2 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-gray-50 shadow-xl"
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.2 }}
					>
						<SpinLoader className="h-6 w-6" />
					</motion.div>
				)}
			</AnimatePresence>
			<div
				id="message-scrollable"
				className="flex h-full w-full flex-col-reverse overflow-auto pb-2 pt-4"
			>
				{loading && !messages?.length ? (
					<SpinLoader className="m-auto" />
				) : null}
				{!loading && !messages?.length ? (
					<div className="m-auto text-3xl font-semibold text-gray-500">
						No messages yet
					</div>
				) : null}
				<InfiniteScroll
					className="relative flex h-full flex-col-reverse gap-1 [&::-webkit-scrollbar]:w-0"
					dataLength={messages?.length || 0}
					inverse={true}
					next={loadMoreMessages}
					hasMore={haveMore && !loading}
					scrollableTarget="message-scrollable"
				>
					{messages?.length
						? messages?.map((message) => {
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

								if (
									message.type === 'image' ||
									message.type === 'emoji'
								)
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

								if (
									message.type === 'voiceCall' ||
									message.type === 'videoCall'
								)
									return (
										<span key={message._id}>
											Calling Started
										</span>
									)
							})
						: null}
				</InfiniteScroll>
			</div>
		</>
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

			<div className="relative flex max-w-[80%] flex-col justify-start gap-1 sm:max-w-[50%]">
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
								: 'bg-gray-200/50 text-gray-800',
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
					className={`absolute -left-7 bottom-1/2 hidden h-5 w-5 translate-y-1/2 items-center justify-center rounded-full text-gray-500 hover:text-secondary-500 ${message.sender.isMine ? 'group-hover:flex' : ''}`}
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
				className="relative flex max-w-[85%] items-center gap-4 rounded-lg bg-gray-200/50 py-3 pl-6 pr-3"
				title={new Date(message.createdAt).toLocaleString()}
			>
				<div className="flex size-7 items-center justify-center">
					<FileIcon ext={message?.content?.split('.').pop()} />
				</div>

				<div className="">
					<p className="line-clamp-1 w-[200px] flex-1 text-sm font-semibold text-gray-700">
						{trimFilename(message?.content, 24)}
					</p>
					<span>
						<p className="inline text-xs text-gray-600">
							{byteToMb(message?.size)} MB
						</p>
						<PiDot className="inline text-gray-600" />
						<p
							className={`inline text-xs capitalize text-gray-600 ${message?.status === 'completed' && 'text-green-500'} ${message?.status === 'cancelled' && 'text-secondary-500'}`}
						>
							{message?.status}
						</p>
					</span>
				</div>
				<span className="absolute right-1.5 top-1.5 flex items-center justify-center rounded-full text-[10px] text-primary-500/70">
					<PiArrowsLeftRightBold />
				</span>
			</div>
		</div>
	)
}

export default ChatContent
