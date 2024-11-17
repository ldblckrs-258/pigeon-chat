import { twMerge } from 'tailwind-merge'
import { PiDotsThreeOutlineVerticalFill } from 'react-icons/pi'
import { FiPhone, FiPhoneCall, FiVideo } from 'react-icons/fi'
import { useChat } from '../../hook/useChat'
import { useEffect } from 'react'

const ChatBoxHeader = ({ userOnline, onClickInfoButton, isInfoExpand }) => {
	const { currentChat } = useChat()

	const handleOpenVoiceCall = () => {
		const url = `/voice-call${currentChat?.isGroup ? '-group' : ''}/${currentChat._id}`
		window.open(
			url,
			'_blank',
			'noopener,noreferrer,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes,width=800,height=600',
		)
	}

	useEffect(() => {
		console.log('currentChat', currentChat)
	}, [currentChat])

	// const handleOpenVideoCall = () => {
	// 	const url = `/video-call/${currentChat._id}`
	// 	window.open(
	// 		url,
	// 		'_blank',
	// 		'noopener,noreferrer,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes,width=800,height=600',
	// 	)
	// }

	return (
		<div className="absolute left-0 top-0 z-10 flex w-full items-center justify-between bg-white px-6 py-4 shadow-md">
			<div className="flex flex-1 items-center justify-start">
				<div className="relative h-10 w-10 border-gray-300">
					<img
						className="h-full w-full overflow-hidden rounded-full border object-cover"
						src={currentChat.avatar}
						alt="targetUser-avatar"
					/>
					{userOnline && (
						<div className="absolute bottom-0 right-0 h-[14px] w-[14px] rounded-full border-2 border-white bg-green-400"></div>
					)}
				</div>

				<div className="ml-3">
					<p className="text-sm font-semibold text-primary-900">
						{currentChat.name}
					</p>
					<p className="text-xs text-primary-700">
						{userOnline ? 'Online' : 'Offline'}
					</p>
				</div>
			</div>

			<div className="flex items-center space-x-2">
				{userOnline && (
					<>
						<button
							className={`flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-200 ${currentChat?.calling === 'voice' ? 'bg-primary-400/10' : ''}`}
							onClick={handleOpenVoiceCall}
							aria-label="Voice Call"
						>
							{currentChat?.calling === 'voice' ? (
								<FiPhoneCall className="animate-shake h-5 w-5 text-primary-600" />
							) : (
								<FiPhone className="h-5 w-5 text-primary-800" />
							)}
						</button>
						{/* <button
							className="flex h-8 w-8 items-center justify-center rounded-full text-primary-800 hover:bg-gray-200"
							onClick={handleOpenVideoCall}
							aria-label="Video Call"
						>
							<FiVideo className="h-5 w-5" />
						</button> */}
					</>
				)}
				<button
					className={twMerge(
						'flex h-7 w-7 items-center justify-center rounded-full text-sm transition-colors',
						isInfoExpand
							? 'bg-primary-600 text-white'
							: 'bg-white text-primary-800 hover:bg-gray-200',
					)}
					onClick={onClickInfoButton}
				>
					<PiDotsThreeOutlineVerticalFill />
				</button>
			</div>
		</div>
	)
}

export default ChatBoxHeader
