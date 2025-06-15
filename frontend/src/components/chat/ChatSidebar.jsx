import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { IoIosChatbubbles } from 'react-icons/io'
import {
	PiCaretRightBold,
	PiEyeBold,
	PiEyeClosedBold,
	PiGearBold,
	PiGearFill,
	PiListBold,
	PiPlusBold,
	PiSignOutBold,
	PiUsersThreeBold,
	PiXBold,
} from 'react-icons/pi'
import { TbEdit } from 'react-icons/tb'
import { twMerge } from 'tailwind-merge'
import { useAuth } from '../../hook/useAuth'
import { useChat } from '../../hook/useChat'
import { useSocket } from '../../hook/useSocket'
import useWindowSize from '../../hook/useWindowSize'
import { timeAgo } from '../../utils/time'
import TextField from '../TextField'
import FriendModal from '../friends/FriendModal'
import AccountModal from '../modal/AccountModal'
import MemberModal from '../modal/MemberModal'
const ChatSidebar = ({ className = '', setPage }) => {
	const { user, logout } = useAuth()
	const { onlineUsers } = useSocket()
	const {
		chats,
		currentChatId,
		unread,
		getChats,
		chatsLoading,
		searchValue,
		setSearchValue,
		openChat,
		friendRequests,
	} = useChat()
	const [showEmail, setShowEmail] = useState(false)
	const [isHoverAvatar, setIsHoverAvatar] = useState(false)
	const hiddenEmail = user.email.replace(/(?<=.{3}).(?=[^@]*?.@)/g, '*')
	const [showModal, setShowModal] = useState(false) // 'add' | 'account' | 'friend'
	const [showMenu, setShowMenu] = useState(false)
	const { isWideScreen, width } = useWindowSize()
	const [isExpand, setIsExpand] = useState(true)

	useEffect(() => {
		if (isWideScreen) {
			setIsExpand(true)
		}
	}, [isWideScreen])

	useEffect(() => {
		if (currentChatId) setIsExpand(false)
		else setIsExpand(true)
	}, [currentChatId])

	return (
		<motion.div
			className={twMerge(
				'fixed left-0 top-0 z-[20] h-full w-[22rem] max-w-[calc(100vw-40px)] rounded-lg bg-gray-200 xl:relative',
				className,
			)}
			animate={{
				left: isWideScreen
					? 0
					: isExpand
						? 0
						: width < 392
							? -width + 40
							: '-22rem',
			}}
			transition={{ duration: 0.3 }}
		>
			<div className="relative flex h-full w-full flex-col gap-1 max-xl:shadow-[8px_0_20px_0_#00000015]">
				<div
					className={`flex w-full items-center justify-center rounded-tr-lg bg-white px-6 py-4 xl:rounded-tl-lg`}
				>
					<div className="flex flex-1 items-center justify-center">
						<div
							className={`flex size-10 items-center justify-center rounded-lg bg-primary-400`}
						>
							<IoIosChatbubbles className="text-2xl text-gray-100" />
						</div>
						<div className="flex flex-1 items-center">
							<h1 className="ml-4 mr-1 text-lg font-semibold text-gray-800">
								Chat Rooms
							</h1>
							{unread > 0 && (
								<span className="h-5 -translate-y-2 rounded-full bg-red-300 px-2 py-0.5 text-xs font-semibold text-gray-700">
									{unread}
								</span>
							)}
						</div>
					</div>
					<div
						className="relative z-10"
						onClick={() => setShowMenu(!showMenu)}
					>
						<AnimatePresence>
							{showMenu && (
								<motion.button
									className="absolute flex h-8 w-8 items-center justify-center gap-1 rounded-full bg-primary-50 text-lg font-semibold text-primary-600 shadow-[0_0_8px_2px_#00000030] hover:bg-primary-100"
									title="New Chat"
									onClick={() => setShowModal('add')}
									initial={{ top: 0, left: -12, opacity: 0 }}
									animate={{
										top: -8,
										left: -46,
										opacity: 1,
									}}
									exit={{ top: 0, left: -12, opacity: 0 }}
									transition={{
										duration: 0.2,
									}}
								>
									<TbEdit />
								</motion.button>
							)}
						</AnimatePresence>
						<AnimatePresence>
							{showMenu && (
								<motion.button
									className="absolute flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-lg font-semibold text-primary-600 shadow-[0_0_8px_2px_#00000030] hover:bg-primary-100"
									title="Friends"
									onClick={() => setShowModal('friend')}
									initial={{
										bottom: 0,
										left: -12,
										opacity: 0,
									}}
									animate={{
										bottom: -37.46,
										left: -37.46,
										opacity: 1,
									}}
									exit={{ bottom: 0, left: -12, opacity: 0 }}
									transition={{ duration: 0.2, delay: 0.1 }}
								>
									<PiUsersThreeBold />
									<div className="relative size-0">
										{friendRequests.length > 0 && (
											<div className="~size-2/2.5 absolute -right-2 -top-4 animate-ping rounded-full bg-red-400"></div>
										)}
									</div>
								</motion.button>
							)}
						</AnimatePresence>
						<AnimatePresence>
							{showMenu && (
								<motion.button
									className="absolute flex h-8 w-8 items-center justify-center gap-1 rounded-full bg-primary-50 text-lg font-semibold text-primary-600 shadow-[0_0_8px_2px_#00000030] hover:bg-primary-100"
									title="Account Settings"
									onClick={() => setShowModal('account')}
									initial={{
										left: 0,
										bottom: -12,
										opacity: 0,
									}}
									animate={{
										left: 8,
										bottom: -46,
										opacity: 1,
									}}
									exit={{ left: 0, bottom: -12, opacity: 0 }}
									transition={{ duration: 0.2, delay: 0.2 }}
								>
									<PiGearBold />
								</motion.button>
							)}
						</AnimatePresence>
						<div className="relative">
							<button
								className={`flex h-8 w-8 items-center justify-center gap-1 rounded-full text-xl font-semibold transition-all ${showMenu ? 'z-10 bg-secondary-100/70 text-secondary-600 shadow-[0_0_8px_2px_#00000030] hover:bg-secondary-100' : 'bg-primary-100/70 text-primary-600 hover:bg-primary-100'} `}
								title="Show Menu"
								onClick={() => setShowMenu(!showMenu)}
							>
								{showMenu ? <PiXBold /> : <PiListBold />}
							</button>
							{friendRequests.length > 0 && !showMenu && (
								<div className="~size-2/2.5 absolute -right-0.5 -top-0.5 animate-ping rounded-full bg-red-400"></div>
							)}
						</div>
					</div>
				</div>
				<div className="h-min-0 flex w-full flex-1 flex-col items-center overflow-hidden overflow-y-auto bg-white p-2">
					<div className="w-full px-4 py-2">
						<TextField
							className="w-full"
							id="search-chat"
							label="Search chat"
							value={searchValue}
							type="text"
							onChange={(e) => setSearchValue(e.target.value)}
						/>
					</div>
					{chats.map((chat) => (
						<div
							key={chat._id}
							className={twMerge(
								'~gap-2/3 ~px-3/4 ~py-2/3 relative flex w-full cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-gray-100',
								currentChatId === chat._id ? 'bg-gray-100' : '',
								chat?.calling ? 'bg-primary-50' : '',
							)}
							onClick={() => openChat(chat._id)}
						>
							<div className={`~size-9/10 relative`}>
								<img
									className="h-full w-full rounded-full border border-gray-300 object-cover"
									src={chat.avatar}
									alt={chat.name}
								/>
								{chat.members.some((member) =>
									onlineUsers.includes(member.toString()),
								) && (
									<span className="absolute bottom-0 right-0 h-[14px] w-[14px] rounded-full border-2 border-white bg-green-400"></span>
								)}
							</div>

							<div className="flex-1">
								<p className="~text-xs/sm line-clamp-1 w-full font-semibold text-primary-900">
									{chat.name}
								</p>
								<div className="flex w-full items-center gap-2">
									<p
										className={`~text-[0.65rem]/[0.75rem] line-clamp-1 w-full flex-1 break-all leading-4 text-primary-900 ${!chat.read && 'font-bold'}`}
									>
										{chat.isMyMessage && 'You: '}{' '}
										{chat.lastMessage}
									</p>
									<p className="text-xs text-primary-600">
										{timeAgo(chat.lastTime)}
									</p>
								</div>
							</div>
							{chat?.calling === 'voice' ? (
								<span className="animate-ping-2 absolute right-2 top-2 h-2 w-2 rounded-full bg-primary-400"></span>
							) : (
								!chat.read && (
									<span className="absolute right-2 top-2 h-3 w-3 rounded-full bg-red-400"></span>
								)
							)}
						</div>
					))}
					{chatsLoading && (
						<>
							<div className="my-1 h-14 w-full animate-pulse items-center justify-center rounded-lg bg-gray-100" />
							<div className="my-1 h-14 w-full animate-pulse items-center justify-center rounded-lg bg-gray-100" />
							<div className="my-1 h-14 w-full animate-pulse items-center justify-center rounded-lg bg-gray-100/90" />
							<div className="my-1 h-14 w-full animate-pulse items-center justify-center rounded-lg bg-gray-100/80" />
							<div className="my-1 h-14 w-full animate-pulse items-center justify-center rounded-lg bg-gray-100/70" />
							<div className="my-1 h-14 w-full animate-pulse items-center justify-center rounded-lg bg-gray-100/60" />
							<div className="my-1 h-14 w-full animate-pulse items-center justify-center rounded-lg bg-gray-100/50" />
						</>
					)}
				</div>
				<div className="relative flex items-center justify-center rounded-br-lg bg-white px-6 py-4 xl:rounded-bl-lg">
					<div className="flex flex-1 items-center justify-center">
						<div
							className={`relative size-9 overflow-hidden rounded-full border border-gray-300`}
							onMouseEnter={() => setIsHoverAvatar(true)}
							onMouseLeave={() => setIsHoverAvatar(false)}
						>
							<img
								className="h-full w-full rounded-full object-cover"
								src={user.avatar}
								alt="user-avatar"
							/>
							{isHoverAvatar && (
								<div
									className="absolute left-0 top-0 flex h-full w-full cursor-pointer items-center justify-center bg-[#00000069]"
									onClick={() => setShowModal('account')}
								>
									<PiGearFill className="text-white" />
								</div>
							)}
						</div>

						<div className="ml-3 flex-1">
							<p className="text-sm font-semibold text-primary-900">
								{user.name}
							</p>
							<div className="flex items-center gap-2">
								<p className="text-xs text-secondary-800">
									{showEmail ? user.email : hiddenEmail}
								</p>
								<button
									className="flex items-center text-sm text-gray-600"
									onClick={() => setShowEmail(!showEmail)}
									title="Show/Hide Email"
								>
									{showEmail ? (
										<PiEyeBold />
									) : (
										<PiEyeClosedBold />
									)}
								</button>
							</div>
						</div>
					</div>
					<button
						className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-gray-800 transition-colors hover:bg-gray-100 active:bg-gray-200"
						onClick={logout}
						title="Logout"
					>
						<PiSignOutBold />
					</button>
				</div>
				<div className="absolute -right-6 top-1/2 z-10 -translate-y-1/2 xl:hidden">
					<button
						className="relative rounded-r-xl bg-white p-1 py-5 shadow-[8px_0_20px_0_#00000015]"
						onClick={() => setIsExpand(!isExpand)}
					>
						<PiCaretRightBold
							className={`transition-all ${isExpand ? 'rotate-180' : ''}`}
						/>
						{unread > 0 && (
							<span className="animate-ping-2 absolute right-1 top-[-2px] size-2 rounded-full bg-secondary-500/70"></span>
						)}
					</button>
				</div>
			</div>

			{showModal === 'account' && (
				<AccountModal onClose={() => setShowModal(null)} />
			)}
			{showModal === 'add' && (
				<MemberModal
					type="create"
					onClose={() => {
						setShowModal(null)
					}}
					onSubmit={() => {
						getChats()
						setShowModal(null)
					}}
				/>
			)}
			{showModal === 'friend' && (
				<FriendModal onClose={() => setShowModal(null)} />
			)}
		</motion.div>
	)
}

export default ChatSidebar
