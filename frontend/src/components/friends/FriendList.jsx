import { useEffect } from 'react'
import { PiChatCircleDotsFill, PiXBold } from 'react-icons/pi'
import axios from 'axios'
import { useToast } from '../../hook/useToast'
import { useChat } from '../../hook/useChat'

const FriendList = ({ friends, setFriends, onlineUsers, onClose }) => {
	const toast = useToast()
	const { setCurrentChatId } = useChat()

	const createChat = async (friendId) => {
		try {
			const res = await axios.post('/api/chats/create', {
				members: [friendId],
			})
			toast.success('Chat created', 'New chat has been created', 3000)
			if (res.data.chatId) {
				setCurrentChatId(res.data.chatId)
				onClose()
			}
		} catch (error) {
			if (error.response?.data?.chatId) {
				setCurrentChatId(error.response.data.chatId)
				onClose()
				return
			}
			if (error.response) {
				toast.error(
					'Failed to create chat',
					error.response.data.message,
					3000,
				)
			} else {
				toast.error(
					'Failed to create chat',
					'Please try again later',
					3000,
				)
			}
		}
	}

	const removeFriend = async (id) => {
		const confirm = window.confirm(
			'Are you sure you want to remove this friend?',
		)
		if (!confirm) return

		try {
			await axios.post('/api/friendships/remove-friend', { friendId: id })
			setFriends((prev) => prev.filter((friend) => friend._id !== id))
			toast.success('Success', 'Friend removed', 3000)
		} catch (err) {
			toast.error('Error', 'Please try again later', 3000)
		}
	}

	useEffect(() => {
		// sort friends by online status
		setFriends((prev) => {
			const online = prev.filter((friend) =>
				onlineUsers.includes(friend._id),
			)
			const offline = prev.filter(
				(friend) => !onlineUsers.includes(friend._id),
			)
			return [...online, ...offline]
		})
	}, [onlineUsers])

	return (
		<div className="w-full">
			{friends.map((friend) => (
				<div
					key={friend._id}
					className="flex items-center justify-between gap-2 rounded-md py-2.5 ~px-3/4 hover:bg-gray-200"
				>
					<div className="flex w-full items-center gap-2">
						<div className="relative">
							<img
								src={friend.avatar}
								alt={friend.name}
								className="rounded-full ~size-8/9"
							/>
							{onlineUsers.includes(friend._id) && (
								<div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
							)}
						</div>
						<div className="flex flex-col">
							<span className="font-semibold ~text-[0.8rem]/[0.9rem] ~leading-4/5">
								{friend.name}
							</span>
							<span className="text-gray-500 ~text-[0.75rem]/[0.8rem] ~leading-3/4">
								{friend.email}
							</span>
						</div>
						<button
							className="ml-auto flex size-6 items-center justify-center rounded-full bg-secondary-400 text-sm text-white transition-colors hover:bg-secondary-500"
							onClick={() => removeFriend(friend._id)}
						>
							<PiXBold className="mr-[-1px]" />
						</button>
						<button
							className="flex size-6 items-center justify-center rounded-full bg-primary-400 text-sm text-white transition-colors hover:bg-primary-500"
							onClick={() => createChat(friend._id)}
						>
							<PiChatCircleDotsFill className="mr-[-1px]" />
						</button>
					</div>
				</div>
			))}
		</div>
	)
}

export default FriendList
