import { useState, useEffect } from 'react'
import { useAuth } from '../hook/useAuth'
import { useSocket } from '../hook/useSocket'
import { twMerge } from 'tailwind-merge'
import { PiDotsThreeOutlineVerticalFill } from 'react-icons/pi'
import { isOnline } from '../utils/validate'

const ChatBoxHeader = ({ chatInfo, onClickInfoButton, isInfoExpand }) => {
	const { user } = useAuth()
	const { onlineUsers } = useSocket()
	const [userOnline, setUserOnline] = useState(false)

	useEffect(() => {
		setUserOnline(isOnline(chatInfo.members, user.id, onlineUsers))
	}, [onlineUsers, chatInfo._id])

	return (
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
	)
}

export default ChatBoxHeader
