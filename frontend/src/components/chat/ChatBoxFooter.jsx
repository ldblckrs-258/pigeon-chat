import axios from 'axios'
import EmojiPicker from 'emoji-picker-react'
import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { FaThumbsUp } from 'react-icons/fa'
import {
	PiArrowsLeftRightBold,
	PiCircleNotchBold,
	PiImageFill,
	PiPaperPlaneTiltFill,
	PiSmileyFill,
	PiUploadBold,
	PiXBold,
} from 'react-icons/pi'
import { useAuth } from '../../hook/useAuth'
import { useChat } from '../../hook/useChat'
import { useToast } from '../../hook/useToast'
import useWindowSize from '../../hook/useWindowSize'
import FileSender from '../modal/FileSender'
import SpinLoader from '../SpinLoader'

const ChatBoxFooter = ({ userOnline }) => {
	const [openEmoji, setOpenEmoji] = useState(false)
	const [message, setMessage] = useState('')
	const inputRef = useRef(null)
	const [isTyping, setIsTyping] = useState(false)
	const inputImgRef = useRef(null)
	const inputFileRef = useRef(null)
	const [uploading, setUploading] = useState(false)
	const toast = useToast()
	const { user } = useAuth()
	const {
		currentChat,
		currentChatId,
		sendAMessage,
		sendThumbUp,
		uploadImage,
	} = useChat()
	const [image, setImage] = useState(null)
	const [openFileTransfer, setOpenFileTransfer] = useState(false)
	const { width } = useWindowSize()
	const handleEmojiClick = (event) => {
		setMessage((prev) => prev + event.emoji)
	}

	const handleSendMessage = () => {
		if (image && image !== 'loading') {
			sendAMessage(image)
			setImage(null)
		} else {
			sendAMessage(message)
			setMessage('')
			inputRef.current.focus()
		}
	}

	const handleUploadImage = (e) => {
		const file = e.target.files[0]
		if (file) {
			setImage('loading')
			uploadImage(file).then((res) => {
				setImage(res)
			})
		}
	}

	const handleUploadFile = async (e) => {
		const file = e.target.files[0]
		if (file) {
			setUploading(true)

			const formData = new FormData()
			formData.append('file', file)
			formData.append('chatId', currentChatId)

			try {
				toast.info('Uploading file...', 'Please wait', 4000)
				const res = await axios.post(
					'/api/messages/sendFile',
					formData,
					{
						headers: {
							'Content-Type': 'multipart/form-data',
						},
					},
				)
				console.log(res?.data)
			} catch (error) {
				console.error(error)
				toast.error(
					'Failed to upload file',
					error.response?.data?.message || 'Please try again later',
					4000,
				)
			}

			setUploading(false)
		}
	}

	return (
		<div className="z-5 ~px-4/6 ~py-3/4 absolute bottom-0 left-0 flex w-full items-center justify-between gap-1 bg-white">
			{openEmoji && (
				<div className="absolute -top-0 left-6 z-[100] translate-y-[-100%] text-sm">
					<EmojiPicker
						width={280}
						height={280}
						skinTonesDisabled
						emojiStyle="native"
						previewConfig={{ showPreview: false }}
						searchDisabled
						onEmojiClick={handleEmojiClick}
					/>
				</div>
			)}
			<motion.div
				className="flex items-center gap-1 overflow-hidden"
				animate={{ width: isTyping && width < 448 ? 0 : 'auto' }}
				transition={{ duration: 0.1 }}
			>
				<button
					className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-primary-400 transition-colors hover:bg-gray-100 active:bg-gray-200"
					onClick={() => inputImgRef.current.click()}
				>
					<PiImageFill />
					<input
						type="file"
						accept="image/*"
						className="hidden"
						ref={inputImgRef}
						onChange={handleUploadImage}
					/>
				</button>
				<button
					className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-primary-400 transition-colors hover:bg-gray-100 active:bg-gray-200"
					onClick={() => inputFileRef.current.click()}
				>
					{uploading ? (
						<PiCircleNotchBold className="animate-spin" />
					) : (
						<PiUploadBold />
					)}
					<input
						type="file"
						accept="*"
						className="hidden"
						ref={inputFileRef}
						onChange={handleUploadFile}
					/>
				</button>
				{!currentChat?.isGroup && userOnline ? (
					<div>
						<button
							className="relative flex h-9 w-9 items-center justify-center rounded-full text-xl text-primary-400 transition-colors hover:bg-gray-100 active:bg-gray-200"
							onClick={() => setOpenFileTransfer(true)}
						>
							<PiArrowsLeftRightBold />
						</button>

						{openFileTransfer && (
							<div
								className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
								onClick={(e) => {
									if (e.target === e.currentTarget) {
										setOpenFileTransfer(false)
									}
								}}
							>
								<FileSender
									targetId={
										currentChat?.members.find(
											(m) => m._id !== user.id,
										)?._id
									}
									onClose={() => setOpenFileTransfer(false)}
								/>
							</div>
						)}
					</div>
				) : null}

				<div className="relative">
					<button
						className="relative flex h-9 w-9 items-center justify-center rounded-full text-xl text-primary-400 transition-colors hover:bg-gray-100 active:bg-gray-200"
						onClick={() => setOpenEmoji(!openEmoji)}
					>
						<PiSmileyFill />
					</button>
				</div>
			</motion.div>
			<div className="relative mx-2 flex-1">
				<input
					ref={inputRef}
					type="text"
					placeholder="Type a message"
					className="h-10 w-full rounded-full bg-gray-100 pl-4 pr-10 text-sm text-primary-900 caret-primary-400 focus:outline-none focus:ring-0"
					autoFocus
					onFocus={() => {
						setIsTyping(true)
						setOpenEmoji(false)
					}}
					onBlur={() => setIsTyping(false)}
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							handleSendMessage()
						}
					}}
				/>
				<button
					className="absolute right-4 top-[10px] text-lg text-primary-400 transition-colors hover:text-primary-500 active:text-primary-600"
					onClick={handleSendMessage}
				>
					<PiPaperPlaneTiltFill />
				</button>
				{image && (
					<div className="absolute -top-2 left-2 h-20 w-20 translate-y-[-100%] rounded-lg shadow-custom">
						{image === 'loading' ? (
							<div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-100">
								<SpinLoader className="size-6" />
							</div>
						) : (
							<img
								className="h-full w-full rounded-lg object-cover"
								src={image}
								alt="uploaded-image"
							/>
						)}
						<button
							className="absolute -right-3 -top-3 flex h-6 w-6 items-center justify-center rounded-full border border-gray-400 bg-white text-sm text-gray-700 transition-colors hover:bg-gray-200"
							onClick={() => setImage(null)}
						>
							<PiXBold />
						</button>
					</div>
				)}
			</div>
			{(isTyping && width < 448) || width < 365 ? null : (
				<button
					className="relative h-9 w-9 items-center justify-center rounded-full text-xl text-primary-400 transition-colors hover:bg-gray-100 active:bg-gray-200"
					onClick={() => sendThumbUp()}
				>
					<FaThumbsUp />
				</button>
			)}
		</div>
	)
}

export default ChatBoxFooter
