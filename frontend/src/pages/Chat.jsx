import ChatBox from '@components/chat/ChatBox'
import ChatInfo from '@components/chat/ChatInfo'
import ChatSidebar from '@components/chat/ChatSidebar'
import CallingModal from '@components/modal/CallingModal'
import { useChat } from '@hooks/useChat'
import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'
const Chat = () => {
	const { currentChat } = useChat()
	const [isInfoExpand, setIsInfoExpand] = useState(false)

	return (
		<div
			className={`flex h-dvh w-full items-center gap-1 overflow-hidden bg-gray-100 p-0 transition-all xs:p-2 sm:gap-3 sm:p-4`}
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
							className="fixed right-0 top-0 h-full rounded-lg max-xl:z-10 xs:py-2 sm:py-4 xl:relative xl:py-0"
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
