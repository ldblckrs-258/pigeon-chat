import { useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import ChatContent from './ChatContent'
import ChatBoxHeader from './ChatBoxHeader'
import ChatBoxFooter from './ChatBoxFooter'
import { useAuth } from '../../hook/useAuth'
import { useSocket } from '../../hook/useSocket'
import { isOnline } from '../../utils/validate'
import { useChat } from '../../hook/useChat'
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
			<div className="h-full min-h-0 w-full bg-white py-[78px] pl-4 pr-1">
				<ChatContent className="flex h-full w-full flex-col-reverse overflow-y-scroll pb-2 pt-4" />
			</div>
			<ChatBoxFooter userOnline={userOnline} />
		</div>
	)
}

export default ChatBox
