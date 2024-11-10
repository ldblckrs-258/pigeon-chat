import { PiX } from 'react-icons/pi'
import { useState, useEffect } from 'react'
import { useSocket } from '../../hook/useSocket'
import { useNotification } from '../../hook/useNotification'
import { PiPhoneCallFill, PiXBold } from 'react-icons/pi'
import axios from 'axios'

export default function CallingModal() {
	const [showModal, setShowModal] = useState(false)
	const { socket } = useSocket()
	const { titleNotify, windowNotify } = useNotification()
	const [chat, setChat] = useState(null)

	const getChatInfo = async (chatId) => {
		try {
			const res = await axios.get(`/api/chats/get/${chatId}`)
			setChat(res.data.data)
		} catch (error) {
			console.error(error)
		}
	}

	const close = () => {
		setShowModal(false)
		setChat(null)
	}

	const open = () => {
		setShowModal(false)
		const url = `/voice-call/${chat?._id}`
		window.open(
			url,
			'_blank',
			'noopener,noreferrer,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes,width=800,height=600',
		)
	}

	useEffect(() => {
		if (!socket) return
		socket.on('voiceCallStart', getChatInfo)
		socket.on('voiceDeviceJoined', close)
		return () => {
			socket.off('incomingCall')
		}
	}, [socket])

	useEffect(() => {
		if (!chat) return
		titleNotify(`${chat?.name} is calling...`)
		windowNotify('Incoming call', `${chat?.name} is calling, pick up!`)
		setShowModal(true)
	}, [chat])

	if (!showModal) return null
	return (
		<div
			className="fixed inset-0 z-[55] flex items-center justify-center bg-black/50"
			onClick={(e) => {
				if (e.target === e.currentTarget) {
					close()
				}
			}}
		>
			<div className="relative flex w-auto max-w-[80vw] flex-col items-center justify-center gap-2 rounded-lg bg-white px-6 py-4 sm:min-h-[40vh] sm:max-w-[20vw]">
				<button
					className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full text-xl hover:bg-gray-100"
					onClick={close}
				>
					<PiX />
				</button>
				<h2 className="text-center text-xl font-semibold">
					Incoming call
				</h2>
				<img
					src={chat?.avatar}
					alt="caller-avatar"
					className="mt-3 size-16 rounded-full"
				/>
				<h3 className="text-center text-2xl font-semibold">
					{chat?.name} is calling you
				</h3>
				<div className="mt-auto flex items-center justify-center gap-14 pt-10">
					<div className="flex flex-col items-center gap-2">
						<button
							className="flex size-12 items-center justify-center rounded-full bg-secondary-500 text-2xl text-white transition-colors hover:bg-secondary-600"
							onClick={close}
						>
							<PiXBold />
						</button>
						<span>Reject</span>
					</div>
					<div className="flex flex-col items-center gap-2">
						<button
							className="flex size-12 items-center justify-center rounded-full bg-primary-500 text-2xl text-white transition-colors hover:bg-primary-600"
							onClick={open}
						>
							<PiPhoneCallFill />
						</button>
						<span>Accept</span>
					</div>
				</div>
			</div>
		</div>
	)
}
