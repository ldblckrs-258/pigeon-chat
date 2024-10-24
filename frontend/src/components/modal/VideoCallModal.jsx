import { useState } from 'react'
import { FiPhone, FiVideo, FiMic, FiUserPlus, FiX } from 'react-icons/fi'

const VideoCallModal = ({ chatInfo }) => {
	// Trạng thái quản lý microphone và camera
	const [isMuted, setIsMuted] = useState(false)
	const [isVideoOff, setIsVideoOff] = useState(false)

	// Trạng thái hiển thị thông báo microphone
	const [showMicNotification, setShowMicNotification] = useState(true)

	// Hàm bật/tắt âm thanh
	const toggleMute = () => {
		setIsMuted(!isMuted)
	}

	// Hàm bật/tắt video
	const toggleVideo = () => {
		setIsVideoOff(!isVideoOff)
	}

	// Hàm tắt thông báo microphone
	const closeMicNotification = () => {
		setShowMicNotification(false)
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
			<div className="relative h-full w-full bg-gray-900">
				{/* Thông báo kết nối microphone */}
				{showMicNotification && (
					<div className="absolute right-4 top-4 flex items-center rounded-md bg-gray-800 px-4 py-2 text-white">
						<FiMic className="mr-2" />
						<span>
							Connected microphone and speaker: Microphone Array
						</span>
						<button
							onClick={closeMicNotification}
							className="ml-4 text-white hover:text-gray-400"
							aria-label="Close notification"
						>
							<FiX className="h-4 w-4" />
						</button>
					</div>
				)}

				{/* Avatar và tên người dùng */}
				<div className="flex h-full flex-col items-center justify-center">
					<img
						src={chatInfo.avatar}
						alt="avatar"
						className="h-32 w-32 rounded-full object-cover"
					/>
					<h2 className="mt-6 text-2xl font-semibold text-white">
						{chatInfo.name}
					</h2>
					<p className="text-lg text-gray-400">Calling...</p>
				</div>

				{/* Các nút điều khiển */}
				<div className="absolute bottom-10 flex w-full justify-center space-x-8">
					{/* Nút bật/tắt video */}
					<button
						onClick={toggleVideo}
						className={`flex h-16 w-16 items-center justify-center rounded-full ${
							isVideoOff ? 'bg-gray-600' : 'bg-gray-700'
						} text-white`}
					>
						<FiVideo className="h-8 w-8" />
					</button>

					{/* Nút bật/tắt micro */}
					<button
						onClick={toggleMute}
						className={`flex h-16 w-16 items-center justify-center rounded-full ${
							isMuted ? 'bg-red-600' : 'bg-gray-700'
						} text-white`}
					>
						<FiMic className="h-8 w-8" />
					</button>

					{/* Nút thêm người */}
					<button className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-700 text-white">
						<FiUserPlus className="h-8 w-8" />
					</button>

					{/* Nút kết thúc cuộc gọi */}
					<button className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white">
						<FiPhone className="h-8 w-8" />
					</button>
				</div>
			</div>
		</div>
	)
}

export default VideoCallModal
