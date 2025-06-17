import { useToast } from '@hooks/useToast'
import axios from 'axios'
import { PiXBold } from 'react-icons/pi'

const SentRequest = ({ data, setData }) => {
	const toast = useToast()

	const cancelRequest = async (id) => {
		try {
			await axios.post('/api/friendships/cancel-request', {
				requestId: id,
			})
			setData((prev) => prev.filter((req) => req._id !== id))
			toast.success('Success', 'Friend request canceled', 3000)
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
			{data.map((req) => (
				<div
					key={req?._id}
					className="~px-3/4 flex items-center justify-between gap-2 rounded-md py-2.5 hover:bg-gray-200"
				>
					<div className="flex w-full items-center gap-2">
						<div className="relative">
							<img
								src={req?.user2?.avatar}
								alt={req?.user2?.name}
								className="~size-8/9 rounded-full"
							/>
						</div>
						<div className="flex flex-col">
							<span className="~text-[0.8rem]/[0.9rem] ~leading-4/5 font-semibold">
								{req?.user2?.name}
							</span>
							<span className="~text-[0.75rem]/[0.8rem] ~leading-3/4 text-gray-500">
								{req?.user2?.email}
							</span>
						</div>
						<button
							className="ml-auto flex size-6 items-center justify-center rounded-full bg-secondary-400 text-sm text-white transition-colors hover:bg-secondary-500"
							onClick={() => cancelRequest(req?._id)}
						>
							<PiXBold />
						</button>
					</div>
				</div>
			))}
		</div>
	)
}

export default SentRequest
