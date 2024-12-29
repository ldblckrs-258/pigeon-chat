import { PiXBold, PiCheckBold } from 'react-icons/pi'
import axios from 'axios'
import { useToast } from '../../hook/useToast'
import { useChat } from '../../hook/useChat'

const Request = ({ data, setData }) => {
	const toast = useToast()
	const { setFriendRequests } = useChat()

	const rejectRequest = async (id) => {
		try {
			await axios.post('/api/friendships/reject-request', {
				requestId: id,
			})
			setData((prev) => prev.filter((req) => req._id !== id))
			setFriendRequests((prev) => prev.filter((req) => req._id !== id))
			toast.success('Success', 'Friend request rejected')
		} catch (err) {
			toast.error('Error', 'Please try again later')
		}
	}

	const acceptRequest = async (id) => {
		try {
			await axios.post('/api/friendships/accept-request', {
				requestId: id,
			})
			setData((prev) => prev.filter((req) => req._id !== id))
			setFriendRequests((prev) => prev.filter((req) => req._id !== id))
			toast.success('Success', 'Friend request accepted', 3000)
		} catch (err) {
			toast.error('Error', 'Please try again later', 3000)
		}
	}

	return (
		<div className="w-full">
			{data.map((req) => (
				<div
					key={req?._id}
					className="flex items-center justify-between gap-2 rounded-md py-2.5 ~px-3/4 hover:bg-gray-200"
				>
					<div className="flex w-full items-center gap-2">
						<div className="relative">
							<img
								src={req?.user1?.avatar}
								alt={req?.user1?.name}
								className="rounded-full ~size-8/9"
							/>
						</div>
						<div className="flex flex-col">
							<span className="font-semibold ~text-[0.8rem]/[0.9rem] ~leading-4/5">
								{req?.user1?.name}
							</span>
							<span className="text-gray-500 ~text-[0.75rem]/[0.8rem] ~leading-3/4">
								{req?.user1?.email}
							</span>
						</div>
						<button
							className="ml-auto flex size-6 items-center justify-center rounded-full bg-secondary-400 text-sm text-white transition-colors hover:bg-secondary-500"
							onClick={() => rejectRequest(req?._id)}
						>
							<PiXBold className="mr-[-1px]" />
						</button>
						<button
							className="flex size-6 items-center justify-center rounded-full bg-green-500 text-sm text-white transition-colors hover:bg-green-600"
							onClick={() => acceptRequest(req?._id)}
						>
							<PiCheckBold className="mr-[-1px]" />
						</button>
					</div>
				</div>
			))}
		</div>
	)
}

export default Request
