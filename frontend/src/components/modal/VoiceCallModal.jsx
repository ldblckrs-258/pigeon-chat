import { useSocket } from '@hooks/useSocket'
import { useToast } from '@hooks/useToast'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FiMic, FiPhone, FiUserPlus, FiX } from 'react-icons/fi'

const VoiceCallModal = ({ chatInfo }) => {
	const { socket } = useSocket()
	const toast = useToast()
	const [isMuted, setIsMuted] = useState(false)
	const [microState, setMicroState] = useState(null)
	const [showMicroState, setShowMicroState] = useState(true)
	const [audioNotification, setAudioNotification] = useState('')
	const [isSpeaking, setIsSpeaking] = useState(false)

	useEffect(() => {
		if (socket) {
			if (
				!navigator.mediaDevices ||
				!navigator.mediaDevices.getUserMedia
			) {
				toast.error(
					'Microphone is unavailable',
					'Your device may not support microphone',
					5000,
				)
				return
			}

			navigator.mediaDevices
				.getUserMedia({ audio: true, video: false })
				.then((stream) => {
					const mediaRecorder = new MediaRecorder(stream)
					let audioChunks = []

					mediaRecorder.addEventListener('dataavailable', (event) => {
						audioChunks.push(event.data)
					})

					mediaRecorder.addEventListener('stop', () => {
						const audioBlob = new Blob(audioChunks)
						audioChunks = []
						const fileReader = new FileReader()
						fileReader.readAsDataURL(audioBlob)
						fileReader.onloadend = () => {
							const base64String = fileReader.result
							socket.emit('audioStream', {
								chatRoomId: chatInfo._id,
								base64String,
							})
						}
					})

					mediaRecorder.start()
					setTimeout(() => {
						mediaRecorder.stop()
					}, 1000)

					navigator.mediaDevices
						.enumerateDevices()
						.then((devices) => {
							const audioInput = devices.find(
								(device) =>
									device.kind === 'audioinput' &&
									device.deviceId ===
										stream.getAudioTracks()[0].getSettings()
											.deviceId,
							)
							if (audioInput) {
								setMicroState(audioInput.label)
							}
						})
				})
				.catch((error) => {
					console.error('Error capturing audio.', error)
				})

			socket.on('callAccepted', () => {
				console.log('Call accepted')
			})

			socket.on('callEnded', () => {
				window.close()
			})

			socket.on('audioStream', (audioData) => {
				let newData = audioData.split(';')
				newData[0] = 'data:audio/ogg;'
				newData = newData[0] + newData[1]

				const audio = new Audio(newData)
				if (!audio || document.hidden) {
					return
				}
				audio.play()
				setAudioNotification('Receiving audio...')
				setTimeout(() => {
					setAudioNotification('')
				}, 2000)
			})

			return () => {
				socket.emit('endVoiceCall', { chatRoomId: chatInfo._id })
				socket.off('callAccepted')
				socket.off('callEnded')
				socket.off('audioStream')
			}
		}
	}, [socket, chatInfo._id])

	useEffect(() => {
		console.log(socket, chatInfo._id)
		if (socket) {
			socket.emit('startVoiceCall', { chatRoomId: chatInfo._id })
		}
	}, [socket, chatInfo._id])

	const toggleMute = () => {
		setIsMuted(!isMuted)
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
			<div className="relative h-full w-full bg-gray-900">
				<AnimatePresence>
					{showMicroState && (
						<motion.div
							className="absolute right-4 top-4 flex items-center overflow-hidden rounded-md bg-gray-800 px-3 py-2 text-sm text-white opacity-60 hover:opacity-100"
							initial={{ width: 40 }}
							animate={{ width: 'auto' }}
							exit={{ width: 40 }}
							transition={{ duration: 0.5 }}
						>
							<FiMic className="mr-2" />
							<span className="line-clamp-1">
								{microState || 'Microphone is not connected'}
							</span>
							<button
								onClick={() => setShowMicroState(false)}
								className="ml-2 text-white transition-all hover:text-red-500"
							>
								<FiX className="h-4 w-4" />
							</button>
						</motion.div>
					)}
				</AnimatePresence>

				<div className="flex h-full flex-col items-center justify-center">
					<img
						src={chatInfo.avatar}
						alt="avatar"
						className="h-32 w-32 rounded-full object-cover"
					/>
					<h2 className="mt-6 text-2xl font-semibold text-white">
						{chatInfo.name}
					</h2>
					<p className="text-lg text-gray-400">Calling...</p>
					{audioNotification ? (
						<p className="mt-4 text-lg text-green-400">
							{audioNotification}
						</p>
					) : (
						<p className="mt-4 text-lg text-green-400">No sound</p>
					)}
				</div>

				<div className="absolute bottom-10 flex w-full justify-center space-x-8">
					<button
						onClick={toggleMute}
						className={`flex h-16 w-16 items-center justify-center rounded-full ${
							isMuted ? 'bg-red-600' : 'bg-gray-700'
						} text-white`}
					>
						<FiMic className="h-8 w-8" />
					</button>

					<button className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-700 text-white">
						<FiUserPlus className="h-8 w-8" />
					</button>

					<button className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white">
						<FiPhone className="h-8 w-8" />
					</button>
				</div>
			</div>
		</div>
	)
}

export default VoiceCallModal
