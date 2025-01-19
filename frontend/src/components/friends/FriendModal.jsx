import { useEffect, useState } from 'react'
import { useAuth } from '../../hook/useAuth'
import { PiXCircleBold } from 'react-icons/pi'
import TextField from '../TextField'
import axios from 'axios'
import useDebounce from '../../hook/useDebounce'
import SpinLoader from '../SpinLoader'
import FriendList from './FriendList'
import Request from './Request'
import SentRequest from './SentRequest'
import FindList from './FindList'
import { useChat } from '../../hook/useChat'
import { useSocket } from '../../hook/useSocket'

const FriendModal = ({ onClose }) => {
	const { user } = useAuth()
	const { onlineUsers } = useSocket()
	const [tabIndex, setTabIndex] = useState(0)
	const [friends, setFriends] = useState([])
	const [searchValue, setSearchValue] = useState('')
	const [pending, setPending] = useState(false)
	const { friendRequests, setFriendRequests } = useChat()

	const searchUser = async () => {
		if (searchValue === '') return
		if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(searchValue)) {
			const res = await axios.get('/api/friendships/search-by-email', {
				params: { email: searchValue },
			})
			setFriends([res.data])
		} else {
			const res = await axios.get('/api/friendships/search-for-friends', {
				params: { search: searchValue },
			})
			setFriends(res.data)
		}
	}

	const getFriends = async () => {
		try {
			const res = await axios.get('/api/friendships/friends', {
				params: { search: searchValue },
			})
			setFriends(res.data)
		} catch (err) {
			console.error(err)
		}
	}

	const getRequests = async () => {
		if (searchValue === '') {
			setFriends(friendRequests)
			return
		}
		try {
			const res = await axios.get('/api/friendships/requests', {
				params: { search: searchValue },
			})
			setFriends(res.data)
			setFriendRequests(res.data)
		} catch (err) {
			console.error(err)
		}
	}

	const getSentRequests = async () => {
		try {
			const res = await axios.get('/api/friendships/sent-requests', {
				params: { search: searchValue },
			})
			setFriends(res.data)
		} catch (err) {
			console.error(err)
		}
	}

	const getList = async () => {
		setPending(true)
		setFriends([])
		switch (tabIndex) {
			case 0:
				getFriends()
				break
			case 1:
				getRequests()
				break
			case 2:
				getSentRequests()
				break
			case 3:
				searchUser()
				break
		}
		setPending(false)
	}

	useDebounce(
		() => {
			getList()
		},
		[searchValue],
		500,
	)

	useEffect(() => {
		if (searchValue === '') getList()
		else setSearchValue('')
	}, [tabIndex])

	return (
		<div
			className="fixed left-0 top-0 z-20 flex h-dvh w-screen items-center justify-center bg-[#00000033]"
			onMouseDown={(e) => e.target === e.currentTarget && onClose()}
		>
			<div className="mx-auto flex h-[70vh] max-w-[95vw] flex-col items-center overflow-hidden rounded-lg bg-white ~w-[24rem]/[28rem] ~gap-2/3 ~px-3/5 ~py-3/5 sm:h-[60vh]">
				<div className="flex w-full items-center justify-between gap-2">
					<div className="flex items-center ~text-[0.785rem]/[0.95rem] ~gap-0/1 ~leading-4/5">
						<button
							className={`rounded py-1 font-semibold ~px-2/4 ${tabIndex === 0 ? 'bg-primary-100 text-primary-600' : 'text-primary-900 hover:bg-gray-100'}`}
							onClick={() => setTabIndex(0)}
						>
							Friends
						</button>
						<button
							className={`relative rounded py-1 font-semibold ~px-2/4 ${tabIndex === 1 ? 'bg-primary-100 text-primary-600' : 'text-primary-900 hover:bg-gray-100'}`}
							onClick={() => setTabIndex(1)}
						>
							Requests
							{friendRequests.length > 0 && (
								<div className="absolute -top-0.5 right-0 rounded-full bg-red-400 ~size-2/2.5"></div>
							)}
						</button>
						<button
							className={`rounded py-1 font-semibold ~px-2/4 ${tabIndex === 2 ? 'bg-primary-100 text-primary-600' : 'text-primary-900 hover:bg-gray-100'}`}
							onClick={() => setTabIndex(2)}
						>
							Sent
						</button>
						<button
							className={`rounded py-1 font-semibold ~px-2/4 ${tabIndex === 3 ? 'bg-primary-100 text-primary-600' : 'text-primary-900 hover:bg-gray-100'}`}
							onClick={() => setTabIndex(3)}
						>
							Find
						</button>
					</div>
					<button
						className="flex h-8 w-8 items-center justify-center rounded-full text-3xl text-secondary-500 opacity-80 hover:text-secondary-600"
						onClick={onClose}
					>
						<PiXCircleBold />
					</button>
				</div>
				<TextField
					className="w-full"
					label="Search"
					value={searchValue}
					onChange={(e) => setSearchValue(e.target.value)}
				/>
				<div className="w-full flex-1 overflow-hidden">
					{friends?.length > 0 && !pending && (
						<div className="h-full w-full overflow-y-auto">
							{tabIndex === 0 && (
								<FriendList
									friends={friends}
									setFriends={setFriends}
									onlineUsers={onlineUsers}
									onClose={onClose}
								/>
							)}
							{tabIndex === 1 && (
								<Request data={friends} setData={setFriends} />
							)}
							{tabIndex === 2 && (
								<SentRequest
									data={friends}
									setData={setFriends}
								/>
							)}
							{tabIndex === 3 && (
								<FindList
									users={friends}
									setUsers={setFriends}
								/>
							)}
						</div>
					)}
					{friends?.length === 0 && !pending && (
						<div className="flex h-full w-full items-center justify-center font-semibold text-gray-500 ~text-base/lg">
							Nothing to show
						</div>
					)}
					{pending && (
						<div className="flex h-full w-full items-center justify-center">
							<SpinLoader className="~size-10/12" />
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default FriendModal
