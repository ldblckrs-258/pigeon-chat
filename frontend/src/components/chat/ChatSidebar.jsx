import { useEffect, useState } from 'react'
import { useAuth } from '../../hook/useAuth'
import { timeAgo } from '../../utils/time'
import PropsTypes from 'prop-types'
import { IoIosChatbubbles } from 'react-icons/io'
import TextField from '../TextField'
import AccountModal from '../modal/AccountModal'
import {
	PiPlusBold,
	PiEyeBold,
	PiEyeClosedBold,
	PiSignOutBold,
	PiGearFill,
} from 'react-icons/pi'
import { twMerge } from 'tailwind-merge'
import { useSocket } from '../../hook/useSocket'
import { useChat } from '../../hook/useChat'
import MemberModal from '../modal/MemberModal'
const ChatSidebar = ({ className = '', isExpanded, setIsExpanded }) => {
	const { user, logout } = useAuth()
	const { onlineUsers } = useSocket()
	const {
		chats,
		currentChatId,
		setCurrentChatId,
		unread,
		getChats,
		searchValue,
		setSearchValue,
		openChat,
	} = useChat()
	const [showEmail, setShowEmail] = useState(false)
	const [isHoverAvatar, setIsHoverAvatar] = useState(false)
	const hiddenEmail = user.email.replace(/(?<=.{3}).(?=[^@]*?.@)/g, '*')
	const [showAddModal, setShowAddModal] = useState(false)
	const [showAccountModal, setShowAccountModal] = useState(false)

	return (
		<div
			className={twMerge(
				'flex flex-col gap-1',
				isExpanded
					? 'w-full max-w-[calc(100vw-16px)] sm:w-[380px]'
					: 'w-20',
				className,
			)}
		>
			{showAddModal && (
				<MemberModal
					type="create"
					onClose={() => {
						setShowAddModal(false)
					}}
					onSubmit={() => {
						getChats()
						setShowAddModal(false)
					}}
				/>
			)}
			<div
				className={`flex w-full items-center justify-center bg-white ${isExpanded ? 'px-6 py-4' : 'px-3 py-3.5'}`}
			>
				<div className="flex flex-1 items-center justify-center">
					<button
						className={`flex items-center justify-center rounded-lg bg-primary-400 ${isExpanded ? 'size-10' : 'size-11'}`}
						onClick={() => setIsExpanded(!isExpanded)}
					>
						<IoIosChatbubbles className="text-2xl text-gray-100" />
					</button>
					{isExpanded && (
						<div className="tiem-center flex flex-1">
							<h1 className="ml-4 mr-1 text-lg font-semibold text-gray-800">
								Messages
							</h1>
							{unread > 0 && (
								<span className="h-5 -translate-y-2 rounded-full bg-red-300 px-2 py-0.5 text-xs font-semibold text-gray-700">
									{unread}
								</span>
							)}
						</div>
					)}
				</div>
				{isExpanded && (
					<button
						onClick={() => {
							setShowAddModal(true)
						}}
						className="flex h-8 w-8 items-center justify-center gap-1 rounded-full bg-primary-300 text-sm font-semibold text-white transition-colors hover:bg-primary-400 active:bg-primary-500"
					>
						<PiPlusBold className="text-xl" />
					</button>
				)}
			</div>
			<div className="h-min-0 flex w-full flex-1 flex-col items-center overflow-y-auto bg-white p-2">
				{isExpanded && (
					<div className="w-full px-4 py-2">
						<TextField
							className="w-full"
							label="Search chat"
							value={searchValue}
							type="text"
							onChange={(e) => setSearchValue(e.target.value)}
						/>
					</div>
				)}
				{chats.map((chat) => (
					<div
						key={chat._id}
						className={twMerge(
							'relative flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg transition-colors hover:bg-gray-100',
							isExpanded ? 'px-4 py-3' : 'p-2',
							currentChatId === chat._id ? 'bg-gray-100' : '',
						)}
						onClick={() => openChat(chat._id)}
					>
						<div
							className={`relative ${isExpanded ? 'size-10' : 'size-11'}`}
						>
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
						{isExpanded && (
							<div className="max-w-[280px] flex-1">
								<p className="line-clamp-1 w-full text-sm font-semibold text-primary-900">
									{chat.name}
								</p>
								<div className="flex w-full items-center gap-2">
									<p
										className={`line-clamp-1 w-full flex-1 text-xs text-primary-900 ${!chat.read && 'font-bold'}`}
									>
										{chat.isMyMessage && 'You: '}{' '}
										{chat.lastMessage}
									</p>
									<p className="text-xs text-primary-600">
										{timeAgo(chat.lastTime)}
									</p>
								</div>
							</div>
						)}
						{!chat.read && (
							<span className="absolute right-2 top-2 h-3 w-3 rounded-full bg-red-400"></span>
						)}
					</div>
				))}
			</div>
			<div className="relative flex items-center justify-center bg-white px-6 py-4">
				<div className="flex flex-1 items-center justify-center">
					<div
						className={`relative overflow-hidden rounded-full border border-gray-300 ${isExpanded ? 'size-9' : 'size-11'}`}
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
								onClick={() => setShowAccountModal(true)}
							>
								<PiGearFill className="text-white" />
							</div>
						)}
					</div>

					{isExpanded && (
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
					)}
				</div>
				{isExpanded && (
					<button
						className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-gray-800 transition-colors hover:bg-gray-100 active:bg-gray-200"
						onClick={logout}
						title="Logout"
					>
						<PiSignOutBold />
					</button>
				)}
			</div>
			{showAccountModal && (
				<AccountModal onClose={() => setShowAccountModal(false)} />
			)}
		</div>
	)
}

ChatSidebar.propTypes = {
	className: PropsTypes.string,
	chatId: PropsTypes.string,
	onChatClick: PropsTypes.func,
}

export default ChatSidebar
