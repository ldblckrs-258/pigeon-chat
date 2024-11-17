import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import ChatSidebar from '../components/chat/ChatSidebar'
import ChatBox from '../components/chat/ChatBox'
import ChatInfo from '../components/chat/ChatInfo'
import { useChat } from '../hook/useChat'
import CallingModal from '../components/modal/CallingModal'
const Chat = () => {
	const { currentChat } = useChat()
	const [isInfoExpand, setIsInfoExpand] = useState(false)

	return (
		<div
			className={`xs:p-2 flex h-dvh w-full items-center gap-1 overflow-hidden bg-gray-100 p-0 transition-all sm:gap-3 sm:p-4`}
		>
			<ChatSidebar />
			{currentChat && (
				<ChatBox
					isInfoExpand={isInfoExpand}
					onClickInfoButton={() => setIsInfoExpand(!isInfoExpand)}
				/>
			)}
			{currentChat && (
				<AnimatePresence>
					{isInfoExpand && (
						<ChatInfo
							className="xs:py-2 fixed right-0 top-0 z-[20] h-full rounded-lg sm:py-4 xl:relative xl:py-0"
							onClose={() => setIsInfoExpand(false)}
						/>
					)}
				</AnimatePresence>
			)}
			<CallingModal />
		</div>
	)
}

export default Chat
