import { twMerge } from 'tailwind-merge'
import { motion, AnimatePresence } from 'framer-motion'
import { isOnline } from '../utils/validate'
import { useAuth } from '../hook/useAuth'
import { useSocket } from '../hook/useSocket'
import {
	PiCaretRightBold,
	PiFloppyDiskBackFill,
	PiPenFill,
	PiXBold,
} from 'react-icons/pi'
import { useState, useRef, useEffect } from 'react'
import { useToast } from '../hook/useToast'
import axios from 'axios'
import MemberModal from './MemberModal'
import TextField from '../components/TextField'

const ChatInfo = ({ className, chatInfo }) => {
	const [expandUser, setExpandUser] = useState(false)
	const [showAddModal, setShowAddModal] = useState(false)
	const toast = useToast()
	const { user } = useAuth()
	const { onlineUsers, updateChat } = useSocket()

	const handleLeaveChat = async () => {
		try {
			await axios.post(`/api/chats/leave/${chatInfo._id}`)
			updateChat(
				chatInfo._id,
				chatInfo.members.map((member) => member._id),
			)

			toast.success('Success', 'Leave chat successfully', 3000)
		} catch (error) {
			console.error(error)
			toast.error('Error', 'Leave chat failed', 3000)
		}
	}

	const handleDeleteChat = async () => {
		try {
			await axios.delete(`/api/chats/delete/${chatInfo._id}`)

			updateChat(
				chatInfo._id,
				chatInfo.members.map((member) => member._id),
			)

			toast.success('Success', 'Delete chat successfully', 3000)
		} catch (error) {
			console.error(error)
			toast.error('Error', 'Delete chat failed', 3000)
		}
	}

	const handleRemoveMember = async (memberId) => {
		try {
			await axios.post(`/api/chats/members/remove`, {
				chatId: chatInfo._id,
				memberId: memberId,
			})
			updateChat(
				chatInfo._id,
				chatInfo.members.map((member) => member._id),
			)
			toast.success('Success', 'Remove member successfully', 3000)
		} catch (error) {
			console.error(error)
			toast.error('Error', 'Remove member failed', 3000)
		}
	}
	const [editChat, setEditChat] = useState(false)
	const [editData, setEditData] = useState()
	const [isHoverAvatar, setIsHoverAvatar] = useState(false)
	const inputImgRef = useRef(null)
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		setEditData({
			name: chatInfo.name,
			avatar: chatInfo.avatar,
		})
	}, [chatInfo])

	const handleUploadImage = async (e) => {
		const file = e.target.files[0]
		if (!file) return
		const formData = new FormData()
		formData.append('image', file)
		setEditData({ ...editData, avatar: URL.createObjectURL(file) })
		setIsLoading(true)
		try {
			const res = await axios.post('/api/tools/upload/image', formData)
			setEditData({ ...editData, avatar: res.data.url })
		} catch (error) {
			console.error(error)
			setEditData({ ...editData, avatar: chatInfo.avatar })
			toast.error('Error', 'Upload image failed', 3000)
		}
		setIsLoading(false)
	}

	const handleEditChat = async () => {
		// wait until the image is uploaded
		while (isLoading) {
			await new Promise((resolve) => setTimeout(resolve, 1000))
		}
		try {
			await axios.post('/api/chats/edit', {
				chatId: chatInfo._id,
				name: editData.name,
				avatar: editData.avatar,
			})
			toast.success('Success', 'Edit chat successfully', 3000)
			updateChat(
				chatInfo._id,
				chatInfo.members.map((member) => member._id),
			)
			setEditChat(false)
		} catch (error) {
			console.error(error)
			toast.error('Error', 'Edit chat failed', 3000)
		}
	}

	return (
		<motion.div
			className={twMerge(
				'relative flex flex-col items-center justify-start px-2 py-4',
				className,
			)}
			initial={{ width: 0 }}
			animate={{ width: 380 }}
			exit={{ width: 0 }}
			transition={{ duration: 0.3, ease: 'easeInOut' }}
		>
			{editChat && (
				<button
					className="absolute right-4 top-4 flex items-center justify-center rounded-full bg-primary-400 p-2 text-white shadow-custom transition-all hover:bg-primary-500 active:shadow-none"
					onClick={handleEditChat}
					title="Save changes"
				>
					<PiFloppyDiskBackFill />
				</button>
			)}
			<div
				className="relative h-20 w-20 overflow-hidden rounded-full border border-gray-200"
				onMouseEnter={() => setIsHoverAvatar(true)}
				onMouseLeave={() => setIsHoverAvatar(false)}
			>
				<img
					className="h-full w-full object-cover"
					src={editChat ? editData.avatar : chatInfo.avatar}
					alt="Chat avatar"
				/>
				{editChat && (
					<input
						type="file"
						accept="image/*"
						className="hidden"
						ref={inputImgRef}
						onChange={handleUploadImage}
					/>
				)}
				{editChat && isHoverAvatar && (
					<button
						className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
						onClick={() => inputImgRef.current.click()}
					>
						<PiPenFill className="mx-auto text-2xl text-white" />
					</button>
				)}
			</div>
			{editChat ? (
				<TextField
					className="mt-2 w-[80%]"
					label="Chat name"
					value={editData.name}
					onChange={(e) =>
						setEditData({ ...editData, name: e.target.value })
					}
					onEnter={handleEditChat}
				/>
			) : (
				<h3 className="line-clamp-1 pt-2 text-lg font-semibold">
					{chatInfo.name}
				</h3>
			)}

			{!editChat && (
				<p className="text-xs text-gray-500">
					{isOnline(chatInfo.members, user.id, onlineUsers)
						? 'Online'
						: 'Offline'}
				</p>
			)}
			<div className="mt-10 flex w-full flex-col">
				{chatInfo.isGroup && (
					<button
						className="flex items-center justify-between rounded-md px-3 py-3 text-[15px] font-semibold transition-colors hover:bg-gray-100 active:bg-gray-200"
						onClick={() => setEditChat(!editChat)}
					>
						<p className="line-clamp-1 flex-1 text-left">
							{editChat
								? 'Cancel editing'
								: 'Edit chat informaton'}
						</p>
					</button>
				)}
				{chatInfo.isGroup && (
					<button
						className="flex items-center justify-between rounded-md px-3 py-3 text-[15px] font-semibold transition-colors hover:bg-gray-100 active:bg-gray-200"
						onClick={() => setExpandUser(!expandUser)}
					>
						<p className="line-clamp-1 flex-1 text-left">
							Group chat members
						</p>
						<motion.div
							initial={{ rotate: 0 }}
							animate={{ rotate: expandUser ? 90 : 0 }}
							transition={{ duration: 0.2 }}
						>
							<PiCaretRightBold />
						</motion.div>
					</button>
				)}
				<AnimatePresence>
					{expandUser && chatInfo.isGroup && (
						<motion.div
							className="mx-auto flex w-full flex-col items-center overflow-hidden px-3"
							initial={{ height: 0 }}
							animate={{ height: 'auto' }}
							exit={{ height: 0 }}
							transition={{ duration: 0.2, ease: 'easeInOut' }}
						>
							{chatInfo.members.map((member) => (
								<div
									key={member._id}
									className="flex w-full items-center gap-4 rounded-md px-3 py-2"
								>
									<div className="relative h-8 w-8 border-gray-300">
										<img
											className="h-full w-full overflow-hidden rounded-full border object-cover"
											src={member.avatar}
											alt={member.name + '-avatar'}
										/>
										{isOnline(
											member._id,
											user.id,
											onlineUsers,
										) && (
											<div className="absolute bottom-0 right-0 h-[14px] w-[14px] rounded-full border-2 border-white bg-green-400"></div>
										)}
									</div>
									<p className="line-clamp-1 flex-1 text-sm font-semibold text-gray-600">
										{member.name}
									</p>
									<button
										className="h-6 w-6 hover:text-secondary-500"
										onClick={() =>
											handleRemoveMember(member._id)
										}
									>
										<PiXBold />
									</button>
								</div>
							))}
						</motion.div>
					)}
				</AnimatePresence>
				<button
					className="flex items-center justify-between rounded-md px-3 py-3 text-[15px] font-semibold transition-colors hover:bg-gray-100 active:bg-gray-200"
					onClick={() => setShowAddModal(true)}
				>
					<p className="line-clamp-1 flex-1 text-left">
						Add member to chat
					</p>
				</button>
				<button
					className="flex items-center justify-between rounded-md px-3 py-3 text-[15px] font-semibold transition-colors hover:bg-gray-100 active:bg-gray-200"
					onClick={handleLeaveChat}
				>
					<p className="line-clamp-1 flex-1 text-left">
						Leave this chat
					</p>
				</button>
				<button
					className="flex items-center justify-between rounded-md px-3 py-3 text-[15px] font-semibold transition-colors hover:bg-gray-100 active:bg-gray-200"
					onClick={handleDeleteChat}
				>
					<p className="line-clamp-1 flex-1 text-left">
						Delete this chat
					</p>
				</button>
			</div>
			<p className="absolute bottom-2 text-xs text-gray-400">
				©2024 Dev01d.com, Inc. All rights reserved
			</p>
			{showAddModal && (
				<MemberModal
					type="add"
					onClose={() => {
						setShowAddModal(false)
					}}
					onSubmit={() => {
						setShowAddModal(false)
					}}
					chatInfo={chatInfo}
				/>
			)}
		</motion.div>
	)
}

export default ChatInfo
