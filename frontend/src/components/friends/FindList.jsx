import { useToast } from '@hooks/useToast'
import axios from 'axios'
import { PiCheckBold, PiPlusBold } from 'react-icons/pi'

const FindList = ({ users, setUsers }) => {
	const toast = useToast()

	const sendRequest = async (id) => {
		try {
			await axios.post('/api/friendships/send-request', { friendId: id })
			toast.success('Success', 'Friend request sent', 3000)
			const newUsers = users.map((user) => {
				if (user._id === id) {
					return { ...user, status: 'pending' }
				}
				return user
			})
			setUsers(newUsers)
		} catch (err) {
			toast.error(
				'Error',
				err.response?.data?.message || 'Please try again later',
				3000,
			)
		}
	}

	return (
		<div className="w-full">
			{users.map((friend) => (
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
							className={`ml-auto flex size-6 items-center justify-center rounded-full border border-primary-600 bg-white text-primary-600 transition-colors ${friend?.status === 'pending' ? 'border-yellow-600 bg-yellow-100 text-yellow-500' : 'border-green-600 bg-green-100 text-green-500'}`}
							onClick={() => sendRequest(friend._id)}
							disabled={friend.status !== undefined}
						>
							{friend.status !== undefined ? (
								<PiCheckBold className="mr-[-1px]" />
							) : (
								<PiPlusBold className="mr-[-1px]" />
							)}
						</button>
					</div>
				</div>
			))}
		</div>
	)
}

export default FindList
