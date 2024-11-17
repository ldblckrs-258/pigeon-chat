import { useParams } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { useSocket } from '../hook/useSocket'
import { useChat } from '../hook/useChat'
import axios from 'axios'
import SpinLoader from '../components/SpinLoader'
import {
	PiMicrophoneFill,
	PiMicrophoneSlashFill,
	PiPhoneDisconnectFill,
	PiSpeakerHighFill,
	PiSpeakerSimpleXFill,
} from 'react-icons/pi'
import { useToast } from '../hook/useToast'
import { useAuth } from '../hook/useAuth'
import { useNavigate } from 'react-router-dom'

const VoiceCallPage = () => {
	const { socket } = useSocket()
	const { chatId } = useParams()
	const navigate = useNavigate()
	const { user } = useAuth()
	const toast = useToast()
	const audioStreamRef = useRef(null)
	const { currentChat, setCurrentChatId } = useChat()
	const [enableMic, setEnableMic] = useState(true)
	const [enableSpeaker, setEnableSpeaker] = useState(true)
	// const [receivingAudio, setReceivingAudio] = useState(false)
	// const audioTimeoutRef = useRef(null)
	const [currentMic, setCurrentMic] = useState(null)
	const [userIds, setUserIds] = useState([])

	const [gridSize, setGridSize] = useState({
		cols: 1,
		rows: 1,
	})

	useEffect(() => {
		const users = userIds.length - 1
		if (users === 1) setGridSize({ cols: 1, rows: 1 })
		else if (users === 2) setGridSize({ cols: 2, rows: 1 })
		else if (users <= 4) setGridSize({ cols: 2, rows: 2 })
		else if (users <= 6) setGridSize({ cols: 3, rows: 2 })
		else if (users <= 9) setGridSize({ cols: 3, rows: 3 })
	}, [userIds])

	const startVoiceCall = async () => {
		try {
			await axios.post('/api/calls/voice/start', { chatId })
		} catch (error) {
			console.error(error)
		}
	}

	const endVoiceCall = async () => {
		try {
			if (socket) socket.emit('leaveVoiceRoom', chatId)
			closeWindow()
		} catch (error) {
			console.error(error)
		}
	}

	const closeWindow = () => {
		navigate('/end-call')
	}

	useEffect(() => {
		startVoiceCall()
		setCurrentChatId(chatId)

		const handleBeforeUnload = (event) => {
			endVoiceCall()
			const confirmationMessage = 'Are you sure you want to leave?'
			event.returnValue = confirmationMessage
			return confirmationMessage
		}

		window.addEventListener('beforeunload', handleBeforeUnload)

		return () => {
			endVoiceCall()
			window.removeEventListener('beforeunload', handleBeforeUnload)
		}
	}, [chatId])

	const handleSendAudioStream = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
			})
			audioStreamRef.current = stream
			var mediaRecorder = new MediaRecorder(stream)
			var audioChunks = []

			mediaRecorder.ondataavailable = (event) => {
				audioChunks.push(event.data)
			}

			mediaRecorder.onstop = async () => {
				const audioBlob = new Blob(audioChunks)
				audioChunks = []
				var fileReader = new FileReader()
				fileReader.readAsDataURL(audioBlob)
				fileReader.onloadend = async () => {
					const base64data = fileReader.result
					socket.emit('audioStream', chatId, base64data)
				}

				mediaRecorder.start()
				setTimeout(() => {
					mediaRecorder.stop()
				}, 300)
			}

			mediaRecorder.start()
			setTimeout(() => {
				mediaRecorder.stop()
			}, 300)

			// set current mic
			const devices = await navigator.mediaDevices.enumerateDevices()
			const mic = devices.find((device) => device.kind === 'audioinput')
			setCurrentMic(mic.label)
		} catch (error) {
			console.error(error)
			toast.error(
				'Failed to connect audio',
				'Please try again later',
				4000,
			)
		}
	}

	const receiveAudioStream = (stream) => {
		var data = stream.split(';')
		data[0] = 'data:audio/ogg'
		data = data.join(';')
		var audio = new Audio(data)
		if (audio && enableSpeaker) {
			audio.play()
		}
	}

	useEffect(() => {
		if (!socket) return
		socket.on('connect', handleSendAudioStream)
		socket.on('callingUsers', (users) => {
			console.log('update users', users)
			setUserIds(users)
		})
		socket.once('voiceCallEnd', closeWindow)

		return () => {
			if (socket) {
				socket.off('connect', handleSendAudioStream)
			}
		}
	}, [socket, enableSpeaker, user])

	useEffect(() => {
		if (!socket) return
		socket.emit('joinVoiceRoom', chatId, user.id)
	}, [socket, chatId, user])

	useEffect(() => {
		if (!socket) return
		if (enableSpeaker) socket.on('audioStream', receiveAudioStream)
		else socket.off('audioStream', receiveAudioStream)
	}, [socket, enableSpeaker])

	useEffect(() => {
		if (audioStreamRef.current) {
			const audioTracks = audioStreamRef.current.getAudioTracks()
			audioTracks.forEach((track) => {
				track.enabled = enableMic
			})
		}
	}, [enableMic])

	if (!currentChat)
		return (
			<div className="flex h-dvh w-screen select-none items-center justify-center">
				<SpinLoader className="size-28" />
			</div>
		)
	return (
		<main className="relative flex h-dvh w-screen items-center justify-center bg-slate-950 p-10 pb-14 text-white sm:p-24 sm:pb-28">
			{userIds.length > 1 ? (
				<div
					className="grid gap-4"
					style={{
						gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)`,
						gridTemplateRows: `repeat(${gridSize.rows}, 1fr)`,
					}}
				>
					{userIds
						.filter((id) => id !== user.id)
						.map((userId) => {
							const user = currentChat.members.find(
								(member) => member._id === userId,
							)
							return (
								<section
									className="relative m-auto flex aspect-square w-full max-w-[40vw] select-none flex-col items-center justify-center rounded-lg !bg-cover !bg-center !bg-no-repeat text-white backdrop:bg-center"
									style={{
										background: `url(${user.avatar})`,
									}}
								>
									<div className="absolute left-0 top-0 z-0 h-full w-full rounded-md bg-black/50 bg-clip-padding backdrop-blur-lg backdrop-filter"></div>
									<div className="relative min-w-20 max-w-[20%] rounded-full p-1">
										<img
											src={user.avatar}
											alt="chat-avatar"
											className={`aspect-square w-full rounded-full`}
										/>
										<div className="avatar-ring absolute left-0 top-0 h-full w-full rounded-full transition-all"></div>
									</div>

									<h3 className="z-10 mt-3 text-xl font-semibold">
										{user.name}
									</h3>
								</section>
							)
						})}{' '}
				</div>
			) : (
				<section className="relative m-auto flex aspect-square w-full max-w-[50vw] select-none flex-col items-center justify-center rounded-lg !bg-cover !bg-center !bg-no-repeat text-white backdrop:bg-center">
					<img
						src={currentChat.avatar}
						alt="chat-avatar"
						className={`aspect-square size-28 rounded-full bg-white`}
					/>
					<h3 className="z-10 mt-3 text-xl font-semibold">
						{currentChat.name}
					</h3>
					<p className="z-10 mt-3 text-lg text-gray-400">
						Waiting for other user to join...
					</p>
				</section>
			)}

			<aside className="fixed bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-6">
				<button
					className={`flex size-14 items-center justify-center rounded-full text-2xl transition-colors ${enableMic ? 'bg-mantis-500 hover:bg-mantis-600' : 'bg-slate-500 hover:bg-slate-600'}`}
					onClick={() => setEnableMic((prev) => !prev)}
				>
					{enableMic ? (
						<PiMicrophoneFill />
					) : (
						<PiMicrophoneSlashFill />
					)}
				</button>
				<button
					className={`flex size-14 items-center justify-center rounded-full text-2xl transition-colors ${enableSpeaker ? 'bg-primary-500 hover:bg-primary-600' : 'bg-slate-500 hover:bg-slate-600'}`}
					onClick={() => setEnableSpeaker((prev) => !prev)}
				>
					{enableSpeaker ? (
						<PiSpeakerHighFill />
					) : (
						<PiSpeakerSimpleXFill />
					)}
				</button>
				<button
					className="flex size-14 items-center justify-center rounded-full bg-secondary-500 text-2xl transition-colors hover:bg-secondary-600"
					onClick={endVoiceCall}
				>
					<PiPhoneDisconnectFill />
				</button>
			</aside>
			{currentMic && (
				<div className="fixed right-3 top-3 flex max-w-[50vw] items-center justify-center gap-2 rounded-md bg-black/30 px-4 py-1.5 opacity-70 transition-all hover:opacity-90">
					<PiMicrophoneFill className="text-sm" />
					<span className="line-clamp-1 text-sm text-white">
						{currentMic}
					</span>
				</div>
			)}
		</main>
	)
}

export default VoiceCallPage
