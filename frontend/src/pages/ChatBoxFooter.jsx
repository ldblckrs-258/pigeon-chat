import { useState, useRef } from 'react'
import {
	PiImageFill,
	PiPaperPlaneTiltFill,
	PiSmileyFill,
	PiXBold,
} from 'react-icons/pi'
import { FaThumbsUp } from 'react-icons/fa'
import { AnimatePresence, motion } from 'framer-motion'
import EmojiPicker from 'emoji-picker-react'
import { useMessage } from '../hook/useMessage'
import DefaultImg from '../assets/default.png'

const ChatBoxFooter = ({ chatInfo }) => {
	const [openEmoji, setOpenEmoji] = useState(false)
	const [message, setMessage] = useState('')
	const inputRef = useRef(null)
	const inputImgRef = useRef(null)
	const { sendAMessage, sendThumbUp, uploadImage } = useMessage()
	const [image, setImage] = useState(null)

	const handleEmojiClick = (event) => {
		setMessage((prev) => prev + event.emoji)
		inputRef.current.focus()
	}

	const handleSendMessage = () => {
		if (image) {
			sendAMessage(image, chatInfo._id, chatInfo.members)
			setImage(null)
		} else {
			sendAMessage(message, chatInfo._id, chatInfo.members)
			setMessage('')
			inputRef.current.focus()
		}
	}

	const handleThumbUp = () => {
		sendThumbUp(chatInfo._id, chatInfo.members)
	}

	const handleUploadImage = (e) => {
		const file = e.target.files[0]
		if (file) {
			setImage(DefaultImg)
			uploadImage(file).then((res) => {
				setImage(res)
			})
		}
	}

	return (
		<div className="z-5 absolute bottom-0 left-0 flex w-full items-center justify-between gap-1 bg-white px-6 py-4">
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
			<div className="relative">
				<button
					className="relative flex h-9 w-9 items-center justify-center rounded-full text-xl text-primary-400 transition-colors hover:bg-gray-100 active:bg-gray-200"
					onClick={() => setOpenEmoji(!openEmoji)}
				>
					<PiSmileyFill />
				</button>
				<AnimatePresence>
					{openEmoji && (
						<motion.div
							className="absolute -top-4 left-0 translate-y-[-100%] text-sm"
							initial={{ opacity: 0, y: '-100%' }}
							animate={{ opacity: 1, y: '-100%' }}
							exit={{ opacity: 0, y: '-100%' }}
							transition={{ duration: 0.2 }}
						>
							<EmojiPicker
								width={280}
								height={280}
								skinTonesDisabled
								emojiStyle="native"
								previewConfig={{ showPreview: false }}
								searchDisabled
								onEmojiClick={handleEmojiClick}
							/>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
			<div className="relative mx-2 flex-1">
				<input
					ref={inputRef}
					type="text"
					placeholder="Type a message"
					className="h-10 w-full rounded-full bg-gray-100 pl-4 pr-10 text-sm text-primary-900 caret-primary-400 focus:outline-none focus:ring-0"
					autoFocus
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
						<img
							className="h-full w-full rounded-lg object-cover"
							src={image}
							alt="uploaded-image"
						/>
						<button
							className="absolute -right-3 -top-3 flex h-6 w-6 items-center justify-center rounded-full border border-gray-400 bg-white text-sm text-gray-700 transition-colors hover:bg-gray-200"
							onClick={() => setImage(null)}
						>
							<PiXBold />
						</button>
					</div>
				)}
			</div>
			<button
				className="relative flex h-9 w-9 items-center justify-center rounded-full text-xl text-primary-400 transition-colors hover:bg-gray-100 active:bg-gray-200"
				onClick={handleThumbUp}
			>
				<FaThumbsUp />
			</button>
		</div>
	)
}

export default ChatBoxFooter
