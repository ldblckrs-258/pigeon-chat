import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import ChatSidebar from '../components/chat/ChatSidebar'
import ChatBox from '../components/chat/ChatBox'
import ChatInfo from '../components/chat/ChatInfo'
import { useChat } from '../hook/useChat'
const Chat = () => {
	const { currentChat } = useChat()
	const [isInfoExpand, setIsInfoExpand] = useState(false)

	return (
		<div
			className={`flex h-dvh w-full items-center gap-1 overflow-hidden bg-gray-100 p-2 transition-all sm:gap-3 sm:p-4`}
		>
			<ChatSidebar className="h-full overflow-hidden rounded-lg transition-all" />
			{currentChat && (
				<ChatBox
					isInfoExpand={isInfoExpand}
					onClickInfoButton={() => setIsInfoExpand(!isInfoExpand)}
				/>
			)}
			{currentChat && (
				<AnimatePresence>
					{isInfoExpand && (
						<ChatInfo className="h-full overflow-hidden rounded-lg bg-white" />
					)}
				</AnimatePresence>
			)}
		</div>
	)
}

export default Chat
