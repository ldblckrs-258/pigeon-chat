import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import ChatSidebar from './ChatSidebar'
import ChatBox from './ChatBox'
import ChatInfo from './ChatInfo'
import { useParams, useNavigate } from 'react-router-dom'
import { useSocket } from '../hook/useSocket'
const Chat = () => {
	const { id } = useParams()
	const [isInfoExpand, setIsInfoExpand] = useState(false)
	const [chatId, setChatId] = useState('')
	const [chatInfo, setChatInfo] = useState(undefined)
	const { lastUpdate } = useSocket()
	const [chatListExpanded, setChatListExpanded] = useState(true)
	useEffect(() => {
		if (id) {
			setChatId(id)
		} else {
			setChatId('')
		}
	}, [id])

	const navigate = useNavigate()
	useEffect(() => {
		if (chatId !== '') {
			navigate(`/${chatId}`)
		}
	}, [chatId])

	const handleGetChat = async (id) => {
		try {
			const res = await fetch(`/api/chats/get/${id}`, {
				method: 'GET',
			})
			const data = await res.json()
			if (!data.data) {
				setChatId('')
			}
			setChatInfo(data.data)
		} catch (error) {
			setChatId('')
			console.error(error)
		}
	}

	useEffect(() => {
		if (chatId && chatId !== '') {
			handleGetChat(chatId)
		}
	}, [chatId])

	useEffect(() => {
		if (lastUpdate && lastUpdate.chatId === chatId) {
			handleGetChat(chatId)
		}
	}, [lastUpdate])

	return (
		<div
			className={`flex h-dvh w-full items-center gap-1 overflow-hidden bg-gray-100 p-2 transition-all sm:gap-3 sm:p-4`}
		>
			<ChatSidebar
				className="h-full overflow-hidden rounded-lg transition-all"
				chatId={chatId}
				onChatClick={(id) => setChatId(id)}
				isExpanded={chatListExpanded}
				setIsExpanded={setChatListExpanded}
			/>
			{chatInfo && (
				<ChatBox
					className={`${chatListExpanded ? 'hidden sm:flex' : ''}`}
					isInfoExpand={isInfoExpand}
					onClickInfoButton={() => setIsInfoExpand(!isInfoExpand)}
					chatInfo={chatInfo}
				/>
			)}
			{chatInfo && (
				<AnimatePresence>
					{isInfoExpand && (
						<ChatInfo
							className="h-full overflow-hidden rounded-lg bg-white"
							chatInfo={chatInfo}
						/>
					)}
				</AnimatePresence>
			)}
		</div>
	)
}

export default Chat
