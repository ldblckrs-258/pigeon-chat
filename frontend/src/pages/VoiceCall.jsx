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

const VoiceCallPage = () => {
	const { socket } = useSocket()
	const { chatId } = useParams()
	const toast = useToast()
	const audioStreamRef = useRef(null)
	const { currentChat, setCurrentChatId } = useChat()
	const [enableMic, setEnableMic] = useState(true)
	const [enableSpeaker, setEnableSpeaker] = useState(true)
	const [receivingAudio, setReceivingAudio] = useState(false)
	const audioTimeoutRef = useRef(null)

	const startVoiceCall = async () => {
		try {
			await axios.post('/api/calls/voice/start', { chatId })
		} catch (error) {
			console.error(error)
		}
	}

	const endVoiceCall = async () => {
		try {
			await axios.post('/api/calls/voice/end', { chatId })
			if (socket) socket.emit('leaveVoiceRoom', chatId)
			window.close()
		} catch (error) {
			console.error(error)
		}
	}

	useEffect(() => {
		setCurrentChatId(chatId)
		startVoiceCall()

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
				}, 1000)
			}

			mediaRecorder.start()
			setTimeout(() => {
				mediaRecorder.stop()
			}, 1000)
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
		setReceivingAudio(true)
		if (audioTimeoutRef.current) {
			clearTimeout(audioTimeoutRef.current)
		}
		audioTimeoutRef.current = setTimeout(() => {
			setReceivingAudio(false)
		}, 1000)
	}

	useEffect(() => {
		if (!socket) return
		socket.emit('joinVoiceRoom', chatId)
		socket.on('connect', handleSendAudioStream)
		if (enableSpeaker) socket.on('audioStream', receiveAudioStream)
		else socket.off('audioStream', receiveAudioStream)

		return () => {
			if (socket) {
				socket.off('connect', handleSendAudioStream)
				socket.off('audioStream', receiveAudioStream)
			}
		}
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
		<main
			className="relative flex h-dvh w-screen select-none flex-col items-center justify-center !bg-cover !bg-center !bg-no-repeat pb-20 text-white backdrop:bg-center"
			style={{
				background: `url(${currentChat.avatar})`,
			}}
		>
			<div className="absolute left-0 top-0 z-0 h-full w-full rounded-md border bg-black/50 bg-clip-padding backdrop-blur-lg backdrop-filter"></div>
			<div className="relative rounded-full p-1">
				<img
					src={currentChat.avatar}
					alt="chat-avatar"
					className={`size-28 rounded-full`}
				/>
				{receivingAudio && (
					<div className="avatar-ring absolute left-0 top-0 h-full w-full rounded-full transition-all"></div>
				)}
			</div>

			<h3 className="z-10 mt-3 text-2xl font-semibold">
				{currentChat?.members?.[0]?.name}
			</h3>
			<aside className="fixed bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-6">
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
		</main>
	)
}

export default VoiceCallPage
