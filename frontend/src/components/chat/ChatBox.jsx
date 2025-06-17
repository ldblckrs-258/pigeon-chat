import { useAuth } from '@hooks/useAuth'
import { useChat } from '@hooks/useChat'
import { useSocket } from '@hooks/useSocket'
import { isOnline } from '@utils/validate'
import { useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import ChatBoxFooter from './ChatBoxFooter'
import ChatBoxHeader from './ChatBoxHeader'
import ChatContent from './ChatContent'
const ChatBox = ({ className = '', isInfoExpand, onClickInfoButton }) => {
	const { user } = useAuth()
	const { onlineUsers } = useSocket()
	const [userOnline, setUserOnline] = useState(false)
	const { currentChat } = useChat()

	useEffect(() => {
		setUserOnline(isOnline(currentChat.members, user.id, onlineUsers))
	}, [onlineUsers, currentChat])

	return (
		<div
			className={twMerge(
				'relative flex h-full flex-1 flex-col overflow-hidden rounded-lg',
				className,
			)}
		>
			<ChatBoxHeader
				userOnline={userOnline}
				onClickInfoButton={onClickInfoButton}
				isInfoExpand={isInfoExpand}
			/>
			<div className="~mt-[3.875rem]/[4.375rem] ~pb-[4rem]/[4.875rem] relative h-full min-h-0 w-full bg-white pl-4 pr-1">
				<ChatContent />
			</div>
			<ChatBoxFooter userOnline={userOnline} />
		</div>
	)
}

export default ChatBox
