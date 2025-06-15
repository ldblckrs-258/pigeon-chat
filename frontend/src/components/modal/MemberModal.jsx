import axios from 'axios'
import { useState } from 'react'
import { PiPlusBold, PiXBold, PiXCircleBold } from 'react-icons/pi'
import { useAuth } from '../../hook/useAuth'
import { useChat } from '../../hook/useChat'
import useDebounce from '../../hook/useDebounce'
import { useSocket } from '../../hook/useSocket'
import { useToast } from '../../hook/useToast'
import SpinLoader from '../SpinLoader'
import TextField from '../TextField'

// type: create | add
const MemberModal = ({ type, onClose, onSubmit, chatInfo }) => {
	const [email, setEmail] = useState('')
	const [members, setMembers] = useState([])
	const [friends, setFriends] = useState([])
	const [searchValue, setSearchValue] = useState('')
	const [pending, setPending] = useState(false)
	const toast = useToast()
	const { onlineUsers } = useSocket()
	const { user } = useAuth()
	const { setCurrentChatId } = useChat()
	const createMode = type === 'create'

	const getFriends = async () => {
		setPending(true)
		try {
			const res = await axios.get('/api/friendships/friends', {
				params: { search: searchValue },
			})
			let friends = res.data.data
			if (!createMode) {
				friends = friends.filter((friend) => {
					return !chatInfo.members.find((m) => m._id === friend._id)
				})
			}
			setFriends(friends)
		} catch (err) {
			console.error(err)
		}
		setPending(false)
	}

	const toggleMember = (member) => {
		if (members.find((m) => m._id === member._id)) {
			setMembers((prev) => prev.filter((m) => m._id !== member._id))
		} else {
			setMembers((prev) => [...prev, member])
		}
	}

	const handleAddMember = async (id) => {
		if (
			!createMode &&
			chatInfo.members.find((member) => member._id === addUser._id)
		) {
			return toast.error(
				'User already in chat',
				'This user is already in the chat',
				3000,
			)
		}
	}

	useDebounce(
		() => {
			getFriends()
		},
		[searchValue],
		500,
	)

	const createChat = async () => {
		try {
			const res = await axios.post('/api/chats/create', {
				members: members.map((member) => member._id),
			})
			toast.success('Chat created', 'New chat has been created', 3000)
			if (res.data.chatId) {
				setCurrentChatId(res.data.chatId)
			}
		} catch (error) {
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

	const addMembers = async () => {
		try {
			await axios.post('/api/chats/members/add', {
				chatId: chatInfo._id,
				members: members.map((member) => member._id),
			})
			toast.success('Members added', 'Members have been added', 3000)
		} catch (error) {
			if (error.response) {
				toast.error(
					'Failed to add members',
					error.response.data.message,
					3000,
				)
			} else {
				toast.error(
					'Failed to add members',
					'Please try again later',
					3000,
				)
			}
		}
	}

	const handleSubmit = async () => {
		if (members.length === 0) {
			return toast.error(
				'No members',
				'Please add at least one member',
				3000,
			)
		}

		if (createMode) {
			await createChat()
		} else {
			await addMembers()
		}
		onSubmit()
	}

	return (
		<div
			className="fixed left-0 top-0 z-[30] flex h-screen w-screen items-center justify-center bg-[#00000033]"
			onClick={(e) => e.target === e.currentTarget && onClose()}
		>
			<div className="~w-[24rem]/[28rem] mx-auto flex max-w-[90vw] flex-col items-center overflow-hidden rounded-lg bg-white">
				<div className="relative w-full px-4 py-4 text-center text-xl font-semibold shadow-lg">
					{createMode ? 'Create new chat' : 'Add members'}
					<button
						className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-2xl text-secondary-500 hover:text-secondary-600"
						onClick={onClose}
					>
						<PiXCircleBold />
					</button>
				</div>
				<div className="relative flex w-full flex-col px-10 pb-4 pt-6">
					<TextField
						label="Enter friend's name or email"
						type="text"
						value={searchValue}
						onChange={(e) => setSearchValue(e.target.value)}
						onEnter={handleAddMember}
					/>
				</div>
				<div className="~px-3/4 flex h-[40vh] w-full flex-col xl:h-[35vh]">
					{friends.length === 0 && !pending && (
						<div className="~text-base/lg flex h-full w-full items-center justify-center text-center font-semibold text-gray-500">
							No friends found
						</div>
					)}
					{pending && (
						<div className="flex h-full w-full items-center justify-center">
							<SpinLoader className="~size-10/12" />
						</div>
					)}
					<div className="w-full flex-1 overflow-hidden">
						<div className="h-full w-full overflow-y-auto">
							<div className="w-full">
								{friends.map((friend) => (
									<div
										key={friend._id}
										className="~px-3/4 flex items-center justify-between gap-2 rounded-md py-2.5 hover:bg-gray-200"
									>
										<div className="flex w-full items-center gap-2">
											<div className="relative">
												<img
													src={friend.avatar}
													alt={friend.name}
													className="~size-8/9 rounded-full"
												/>
												{onlineUsers.includes(
													friend._id,
												) && (
													<div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
												)}
											</div>
											<div className="flex flex-col">
												<span className="~text-[0.8rem]/[0.9rem] ~leading-4/5 font-semibold">
													{friend.name}
												</span>
												<span className="~text-[0.75rem]/[0.8rem] ~leading-3/4 text-gray-500">
													{friend.email}
												</span>
											</div>
											<button
												className={`ml-auto flex size-6 items-center justify-center rounded-full text-sm transition-colors ${
													members.find(
														(m) =>
															m._id ===
															friend._id,
													)
														? 'border border-secondary-500 bg-secondary-100 text-secondary-500 hover:bg-secondary-200'
														: 'bg-primary-400 text-white hover:bg-primary-500'
												}`}
												onClick={() => {
													toggleMember(friend)
												}}
											>
												{members.find(
													(m) => m._id === friend._id,
												) ? (
													<PiXBold className="mr-[-1px]" />
												) : (
													<PiPlusBold className="mr-[-1px]" />
												)}
											</button>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
				<div className="~px-4/6 mb-4 mt-6 flex w-full items-center gap-1">
					<div className="flex -space-x-3 overflow-hidden rtl:space-x-reverse">
						{members.map((member) => (
							<div
								key={member._id}
								className="flex items-center gap-2 rounded-full bg-primary-100"
							>
								<img
									src={member.avatar}
									alt={member.name}
									className="~size-6/7 rounded-full"
								/>
							</div>
						))}
					</div>
					<button
						className="ml-auto flex h-8 items-center justify-center gap-2 rounded-lg bg-primary-400 px-4 font-semibold text-white transition-colors hover:bg-primary-500 active:bg-primary-600"
						onClick={handleSubmit}
					>
						{createMode ? 'Create' : 'Add'}
					</button>
				</div>
			</div>
		</div>
	)
}

export default MemberModal
