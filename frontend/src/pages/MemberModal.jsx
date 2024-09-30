import { PiXCircleBold, PiXBold } from 'react-icons/pi'
import TextField from '../components/TextField'
import { useState } from 'react'
import axios from 'axios'
import { useToast } from '../hook/useToast'
import { useAuth } from '../hook/useAuth'
import { useSocket } from '../hook/useSocket'

// type: create | add
const MemberModal = ({ type, onClose, onSubmit, chatInfo }) => {
	const [email, setEmail] = useState('')
	const [members, setMembers] = useState([])
	const toast = useToast()
	const { user } = useAuth()
	const { updateChat } = useSocket()
	const createMode = type === 'create'

	const handleAddMember = async () => {
		if (!email) return
		if (email === user.email) {
			toast.error(
				'Invalid email',
				'You do not need to add yourself',
				3000,
			)
			return
		}
		if (members.find((member) => member.email === email)) {
			return toast.error(
				'User already added',
				'This user is already added',
				3000,
			)
		}

		let addUser = null

		try {
			const res = await axios.get('/api/users/find', {
				params: { email },
			})
			addUser = res.data.user
		} catch (error) {
			return toast.error(
				'User not found',
				'This user does not exist',
				3000,
			)
		}

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

		setMembers((prev) => [...prev, { ...addUser, email }])
		setEmail('')
	}

	const handleRemoveMember = (id) => {
		setMembers((prev) => prev.filter((member) => member._id !== id))
	}

	const createChat = async () => {
		try {
			await axios.post('/api/chats/create', {
				members: members.map((member) => member._id),
			})
			toast.success('Chat created', 'New chat has been created', 3000)
			updateChat(
				'',
				members.map((member) => member._id),
			)
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
			updateChat(
				chatInfo._id,
				members.concat(chatInfo.members).map((member) => member._id),
			)
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
		<div className="fixed left-0 top-0 z-20 flex h-screen w-screen items-center justify-center bg-[#00000033]">
			<div className="mx-auto flex w-[440px] flex-col items-center overflow-hidden rounded-lg bg-white">
				<div className="relative w-full px-4 py-4 text-center text-xl font-semibold shadow-lg">
					{createMode ? 'Create new chat' : 'Add members'}
					<button
						className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-2xl text-secondary-500 hover:text-secondary-600"
						onClick={onClose}
					>
						<PiXCircleBold />
					</button>
				</div>
				<div className="flex w-full flex-col px-10 pb-4 pt-6">
					<TextField
						label="Enter email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						onEnter={handleAddMember}
					/>
				</div>
				<div className="flex min-h-20 w-full flex-col px-10">
					{members.length === 0 && (
						<p className="py-5 text-center text-sm text-primary-800">
							Press enter to add member via email
						</p>
					)}
					{members.map((member, index) => (
						<div
							key={member._id}
							className={`flex items-center justify-between gap-2 border-b border-gray-300 py-1 pl-4 pr-2 hover:bg-primary-100 ${index % 2 === 0 ? 'bg-gray-100' : ''} `}
						>
							<p className="text-sm text-primary-900">
								{member.name}
							</p>
							<button
								className="flex h-6 w-6 items-center justify-center rounded-full hover:text-secondary-500"
								onClick={() => handleRemoveMember(member._id)}
							>
								<PiXBold />
							</button>
						</div>
					))}
				</div>
				<div className="mb-4 mt-6 flex w-full items-center justify-end px-6">
					<button
						className="flex h-8 items-center justify-center gap-2 rounded-lg bg-primary-400 px-6 font-semibold text-white transition-colors hover:bg-primary-500 active:bg-primary-600"
						onClick={handleSubmit}
					>
						{createMode ? 'Create chat' : 'Add members'}
					</button>
				</div>
			</div>
		</div>
	)
}

export default MemberModal
