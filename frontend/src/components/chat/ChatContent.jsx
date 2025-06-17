import mql from '@microlink/mql'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
	PiArrowsLeftRightBold,
	PiDot,
	PiDownloadBold,
	PiTrashBold,
} from 'react-icons/pi'
import InfiniteScroll from 'react-infinite-scroll-component'
import { twMerge } from 'tailwind-merge'
import DefaultImg from '../../assets/default.png'
import { useChat } from '../../hook/useChat'
import { useLightbox } from '../../hook/useLightbox'
import { useSocket } from '../../hook/useSocket'
import { useToast } from '../../hook/useToast'
import { byteToMb, trimFilename } from '../../utils/format'
import FileIcon from '../FileIcon'
import SpinLoader from '../SpinLoader'
const ChatContent = ({ className }) => {
	const toast = useToast()
	const {
		messages: rawMessages,
		haveMore,
		loadMoreMessages,
		loading,
		isGroup,
	} = useChat()
	const { onlineUsers } = useSocket()
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
			toast.error(
				'Delete message failed',
				error.response?.data?.message || 'Please try again later',
				3000,
			)
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
					<SpinLoader className="~size-12/16 m-auto" />
				) : null}
				{!loading && !messages?.length ? (
					<div className="~text-xl/3xl m-auto font-semibold text-gray-500">
						No messages yet
					</div>
				) : null}
				<InfiniteScroll
					className="relative flex h-full flex-col-reverse gap-1 @container [&::-webkit-scrollbar]:w-0"
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
											isOnline={onlineUsers.includes(
												message.sender._id,
											)}
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
											isOnline={onlineUsers.includes(
												message.sender._id,
											)}
											onDelete={handleDeleteMessage}
										/>
									)

								if (message.type === 'fileTransfer')
									return (
										<FileTransferHistory
											key={message._id}
											message={message}
											isGroup={isGroup}
											isOnline={onlineUsers.includes(
												message.sender._id,
											)}
										/>
									)

								if (message.type === 'file')
									return (
										<FileUploaded
											key={message._id}
											message={message}
											isGroup={isGroup}
											isOnline={onlineUsers.includes(
												message.sender._id,
											)}
											onDelete={handleDeleteMessage}
										/>
									)
							})
						: null}
				</InfiniteScroll>
			</div>
		</>
	)
}

const TextMessage = ({ message, isGroup, onDelete, isOnline }) => {
	const [parts, setParts] = useState([])
	const [firstLink, setFirstLink] = useState()
	const [loading, setLoading] = useState(false)
	const [data, setData] = useState()

	const linkify = (text) => {
		const urlRegex = /(https?:\/\/[^\s]+)/g
		const parts = text.split(urlRegex)
		const matches = text.match(urlRegex)
		if (!matches) return [{ type: 'text', content: text }]
		return parts.reduce((acc, part, index) => {
			if (matches.includes(part)) {
				const lastChar = part.slice(-1)
				if (!lastChar.match(/[a-zA-Z0-9]/)) {
					const link = part.slice(0, -1)
					acc.push({ type: 'link', content: link })
					acc.push({ type: 'text', content: lastChar })
				} else {
					acc.push({ type: 'link', content: part })
				}
			} else {
				acc.push({ type: 'text', content: part })
			}
			return acc
		}, [])
	}

	const getData = async () => {
		setLoading(true)
		const { status, data } = await mql(firstLink, {
			screenshot: false,
		})
		if (status === 'success') {
			setData(data)
			setLoading(false)
		}
	}

	useEffect(() => {
		const parts = linkify(message.content)
		setParts(parts)
		setFirstLink(parts.find((part) => part.type === 'link')?.content)
	}, [message.content])

	useEffect(() => {
		if (firstLink) getData()
	}, [firstLink])

	return (
		<div
			className={twMerge(
				'group flex w-full items-end gap-2',
				message.sender.isMine ? 'justify-end pr-3' : 'justify-start',
				firstLink && 'my-1',
			)}
		>
			{!message.sender.isMine &&
			['end', 'alone'].includes(message?.position) ? (
				<div className="relative">
					<img
						className="mb-1 h-7 w-7 rounded-full border border-gray-200 object-cover"
						src={message.sender.avatar}
						alt={`${message.sender.name} avatar`}
					/>
					{isOnline && (
						<span className="absolute -right-0.5 bottom-1 size-3 rounded-full border-2 border-white bg-green-400"></span>
					)}
				</div>
			) : (
				<div className="w-7" />
			)}

			<div
				className={`relative flex max-w-[70%] flex-col justify-start gap-1 md:max-w-[55%] xl:max-w-[40%] ${['start', 'alone'].includes(message?.position) && 'mt-4'} ${firstLink && '~w-[20rem]/[24rem]'}`}
			>
				{isGroup &&
					!message.sender.isMine &&
					['start', 'alone'].includes(message?.position) && (
						<div className="mt-2 pl-2 text-xs">
							{message.sender?.name}
						</div>
					)}
				<div className="flex w-full">
					<div
						className={twMerge(
							'w-full overflow-hidden break-words rounded-[16px] text-sm',
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
						<div className="px-3 py-2">
							{parts.map((part, index) => {
								if (part.type === 'link')
									return (
										<a
											key={index}
											href={part.content}
											target="_blank"
											className={`break-all font-semibold underline transition-all ${message.sender.isMine ? 'text-white hover:text-primary-100' : 'hover:text-primary-600'}`}
										>
											{part.content}
										</a>
									)
								return part.content
							})}
						</div>
						{firstLink && (loading || data) ? (
							<div className={`flex w-full flex-col`}>
								{loading ? (
									<div className="~h-[12.3rem]/[15rem] mt-1 flex w-full items-center justify-center bg-gray-200">
										<SpinLoader className="~size-8/10 m-auto" />
									</div>
								) : (
									data && (
										<>
											<img
												src={
													data?.screenshot?.url ||
													data?.image?.url ||
													DefaultImg
												}
												alt={data?.title}
												className="aspect-[9/4] h-[calc(100%-16rem)] w-full flex-1 cursor-pointer border-l border-r border-gray-200 object-cover"
												onClick={() =>
													window.open(firstLink)
												}
											/>
											<div
												className={`~px-3/4 h-fit w-full py-2 text-gray-950 ${message.sender.isMine ? 'bg-gray-100' : 'bg-gray-200'}`}
											>
												<h4
													className="~text-[0.85rem]/sm ~leading-[1rem]/5 cursor-pointer pb-1 font-semibold hover:underline"
													onClick={() =>
														window.open(firstLink)
													}
												>
													{data?.title}
												</h4>
												<p className="~text-[0.7rem]/xs ~leading-[0.83rem]/[0.9rem] line-clamp-2 text-gray-600">
													{data?.description}
												</p>
											</div>
										</>
									)
								)}
							</div>
						) : null}
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
		<div className="~text-xs/sm mt-2 flex w-full justify-center text-gray-400">
			{message}
		</div>
	)
}

const IEMessage = ({ message, isGroup, onDelete, isOnline }) => {
	const { openLightbox } = useLightbox()

	return (
		<div
			className={twMerge(
				'group flex w-full items-end gap-2',
				message.sender.isMine ? 'justify-end pr-3' : 'justify-start',
			)}
		>
			{!message.sender.isMine &&
			(message.position === 'end' || message.position === 'alone') ? (
				<div className="relative">
					<img
						className="mb-1 h-7 w-7 rounded-full border border-gray-200 object-cover"
						src={message.sender.avatar}
						alt={`${message.sender.name} avatar`}
					/>
					{isOnline && (
						<span className="absolute -right-0.5 bottom-1 size-3 rounded-full border-2 border-white bg-green-400"></span>
					)}
				</div>
			) : (
				<div className="w-7" />
			)}

			<div
				className={`relative flex max-w-[70%] flex-col justify-start gap-1 xl:max-w-[45%] ${['start', 'alone'].includes(message?.position) && 'mt-4'}`}
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
					className="text-3xl"
					title={new Date(message.createdAt).toLocaleString()}
				>
					{message.type === 'image' ? (
						<div className="overflow-hidden rounded-lg border border-gray-200 bg-black/90">
							<img
								className="max-h-[200px] w-full cursor-pointer object-cover"
								src={message.content}
								alt={`${message._id}-image`}
								onClick={() => openLightbox(message.content)}
								onError={(e) => {
									e.target.src = DefaultImg
								}}
							/>
						</div>
					) : (
						message.content
					)}
				</div>
				<button
					className={`absolute -left-5 top-1/2 hidden h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-gray-500 hover:text-secondary-500 ${message.sender.isMine ? 'group-hover:flex' : ''}`}
					onClick={() => onDelete(message._id)}
				>
					<PiTrashBold />
				</button>
			</div>
		</div>
	)
}

const FileTransferHistory = ({ message, isGroup, isOnline }) => {
	return (
		<div
			className={twMerge(
				'group flex w-full items-end gap-2',
				message.sender.isMine ? 'justify-end pr-3' : 'justify-start',
			)}
		>
			{!message.sender.isMine &&
			(message.position === 'end' || message.position === 'alone') ? (
				<div className="relative">
					<img
						className="mb-1 h-7 w-7 rounded-full border border-gray-200 object-cover"
						src={message.sender.avatar}
						alt={`${message.sender.name} avatar`}
					/>
					{isOnline && (
						<span className="absolute -right-0.5 bottom-1 size-3 rounded-full border-2 border-white bg-green-400"></span>
					)}
				</div>
			) : (
				<div className="w-7" />
			)}
			<div
				className={`relative flex max-w-[75%] flex-col justify-start gap-1 xl:max-w-[45%] ${['start', 'alone'].includes(message?.position) && 'mt-4'}`}
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
					className="~gap-3/4 ~pr-1.5/3 ~pl-4/6 relative flex items-center rounded-lg bg-gray-200/50 py-3"
					title={new Date(message.createdAt).toLocaleString()}
				>
					<div className="flex size-7 items-center justify-center">
						<FileIcon ext={message?.content?.split('.').pop()} />
					</div>

					<div className="">
						<p className="~text-xs/sm ~w-[10rem]/[12.5rem] line-clamp-1 flex-1 font-semibold text-gray-700">
							{trimFilename(message?.content, 26)}
						</p>
						<span>
							<p className="~text-[0.7rem]/xs inline text-gray-600">
								{byteToMb(message?.size)} MB
							</p>
							<PiDot className="inline text-gray-600" />
							<p
								className={`~text-[0.7rem]/xs inline capitalize text-gray-600 ${message?.status === 'completed' && 'text-green-500'} ${message?.status === 'cancelled' && 'text-secondary-500'}`}
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
		</div>
	)
}

const FileUploaded = ({ message, isGroup, isOnline, onDelete }) => {
	return (
		<div
			className={twMerge(
				'group flex w-full items-end gap-2',
				message.sender.isMine ? 'justify-end pr-3' : 'justify-start',
			)}
		>
			{!message.sender.isMine &&
			(message.position === 'end' || message.position === 'alone') ? (
				<div className="relative">
					<img
						className="mb-1 h-7 w-7 rounded-full border border-gray-200 object-cover"
						src={message.sender.avatar}
						alt={`${message.sender.name} avatar`}
					/>
					{isOnline && (
						<span className="absolute -right-0.5 bottom-1 size-3 rounded-full border-2 border-white bg-green-400"></span>
					)}
				</div>
			) : (
				<div className="w-7" />
			)}
			<a
				className={`relative flex max-w-[75%] cursor-pointer flex-col justify-start gap-1 xl:max-w-[45%] ${['start', 'alone'].includes(message?.position) && 'mt-4'}`}
				href={`/api/uploads/${message.content}`}
				download={message.content}
				target="_blank"
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
					className="~gap-3/4 ~pr-1.5/3 ~pl-4/6 relative flex items-center rounded-lg bg-gray-200/50 py-3"
					title={new Date(message.createdAt).toLocaleString()}
				>
					<div className="flex size-7 items-center justify-center">
						<FileIcon ext={message?.content?.split('.').pop()} />
					</div>

					<div className="">
						<p className="~text-xs/sm ~w-[10rem]/[12.5rem] line-clamp-1 flex-1 font-semibold text-gray-700">
							{trimFilename(message?.content, 26)}
						</p>
						<span>
							<p className="~text-[0.7rem]/xs inline text-gray-600">
								{byteToMb(message?.size)} MB
							</p>
							<PiDot className="inline text-gray-600" />
							<p
								className={`~text-[0.7rem]/xs inline capitalize text-primary-600 hover:underline`}
							>
								<PiDownloadBold className="mr-1 inline" />
								Download
							</p>
						</span>
					</div>
				</div>
				<button
					className={`absolute -left-7 bottom-1/2 hidden h-5 w-5 translate-y-1/2 items-center justify-center rounded-full text-gray-500 hover:text-secondary-500 ${message.sender.isMine ? 'group-hover:flex' : ''}`}
					onClick={(e) => {
						e.preventDefault()
						onDelete(message._id)
					}}
				>
					<PiTrashBold />
				</button>
			</a>
		</div>
	)
}

export default ChatContent
