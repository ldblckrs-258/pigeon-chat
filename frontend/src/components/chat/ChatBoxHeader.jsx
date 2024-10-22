import { useState, useEffect } from 'react'
import { useAuth } from '../../hook/useAuth'
import { useSocket } from '../../hook/useSocket'
import { twMerge } from 'tailwind-merge'
import { PiDotsThreeOutlineVerticalFill } from 'react-icons/pi'
import { FiPhone, FiVideo } from 'react-icons/fi'
import { isOnline } from '../../utils/validate'
import VoiceCallModal from '../modal/VoiceCallModal'
import VideoCallModal from '../modal/VideoCallModal'

const ChatBoxHeader = ({ chatInfo, onClickInfoButton, isInfoExpand }) => {
	const { user } = useAuth()
	const { onlineUsers } = useSocket()
	const [userOnline, setUserOnline] = useState(false)

	// State quản lý việc mở modal
	const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false)
	const [isVideoCallOpen, setIsVideoCallOpen] = useState(false)

	useEffect(() => {
		setUserOnline(isOnline(chatInfo.members, user.id, onlineUsers))
	}, [onlineUsers, chatInfo._id])

	// Hàm mở/đóng các modal
	const handleOpenVoiceCall = () => setIsVoiceCallOpen(true)
	const handleCloseVoiceCall = () => setIsVoiceCallOpen(false)

	const handleOpenVideoCall = () => setIsVideoCallOpen(true)
	const handleCloseVideoCall = () => setIsVideoCallOpen(false)

	return (
		<>
			<div className="absolute left-0 top-0 flex w-full items-center justify-between bg-white px-6 py-4 shadow-md">
				<div className="flex flex-1 items-center justify-start">
					<div className="relative h-10 w-10 border-gray-300">
						<img
							className="h-full w-full overflow-hidden rounded-full border object-cover"
							src={chatInfo.avatar}
							alt="targetUser-avatar"
						/>
						{userOnline && (
							<div className="absolute bottom-0 right-0 h-[14px] w-[14px] rounded-full border-2 border-white bg-green-400"></div>
						)}
					</div>

					<div className="ml-3">
						<p className="text-sm font-semibold text-primary-900">
							{chatInfo.name}
						</p>
						<p className="text-xs text-primary-700">
							{userOnline ? 'Online' : 'Offline'}
						</p>
					</div>
				</div>

				{/* Thêm button gọi thoại và gọi video */}
				<div className="flex items-center space-x-2">
					<button
						className="flex h-8 w-8 items-center justify-center rounded-full text-primary-800 hover:bg-gray-200"
						onClick={handleOpenVoiceCall}
						aria-label="Voice Call"
					>
						<FiPhone className="h-5 w-5" />
					</button>

					<button
						className="flex h-8 w-8 items-center justify-center rounded-full text-primary-800 hover:bg-gray-200"
						onClick={handleOpenVideoCall}
						aria-label="Video Call"
					>
						<FiVideo className="h-5 w-5" />
					</button>

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

			{/* Render Voice Call Modal */}
			<VoiceCallModal
				isOpen={isVoiceCallOpen}
				onClose={handleCloseVoiceCall}
				chatInfo={chatInfo}
			/>

			{/* Render Video Call Modal */}
			<VideoCallModal
				isOpen={isVideoCallOpen}
				onClose={handleCloseVideoCall}
				chatInfo={chatInfo}
			/>
		</>
	)
}

export default ChatBoxHeader
