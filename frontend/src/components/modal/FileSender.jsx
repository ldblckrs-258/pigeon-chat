import { useSocket } from '../../hook/useSocket'
import axios from 'axios'
import { useEffect, useState, useRef } from 'react'
import { PiTrash, PiX } from 'react-icons/pi'
import { useToast } from '../../hook/useToast'
import { useChat } from '../../hook/useChat'
import { useAuth } from '../../hook/useAuth'
import { byteToMb, trimFilename } from '../../utils/format'
import { STATUS } from './constants'
import FileIcon from '../FileIcon'

export default function FileSender({ targetId, onClose }) {
	const { currentChat } = useChat()
	const { user } = useAuth()
	const [file, setFile] = useState(null)
	const [dataChannel, setDataChannel] = useState(null)
	const localPeer = useRef(null)
	const [progress, setProgress] = useState({ current: 0, total: 0 })
	const { socket } = useSocket()
	const toast = useToast()
	const [isReady, setIsReady] = useState(false)
	const [status, setStatus] = useState(STATUS.NONE)

	const getIceServers = async () => {
		try {
			const response = await axios.get(
				'/api/tools/ice-servers?types=private,cloudflare',
			)
			return response.data
		} catch (error) {
			console.error('Error getting ICE servers', error)
			return []
		}
	}

	const requestFileTransfer = () => {
		if (!file) {
			console.error('Please select a file')
			return
		}
		socket.emit(
			'sendFileRequest',
			{ name: file.name, size: file.size },
			targetId,
		)
		setStatus(STATUS.PENDING)
	}

	const cancelFileTransfer = async () => {
		if (
			status === STATUS.DONE ||
			status === STATUS.CANCELLED ||
			status === STATUS.NONE
		) {
			onClose()
			return
		}
		setStatus(STATUS.CANCELLED)
		await createHistory('cancelled')
		clearAll()
		socket.emit('fileTransferCancel', targetId)
	}

	const sendSenderDesc = async () => {
		await handleLocalConnect()
		socket.emit('senderDesc', localPeer.current.localDescription, targetId)
		setStatus(STATUS.CONNECTING)
	}

	const handleLocalConnect = async () => {
		const dataChannel = localPeer.current.createDataChannel('fileTransfer')
		dataChannel.binaryType = 'arraybuffer'
		dataChannel.onopen = () => {
			console.log('Sender data channel connected')
			setIsReady(true)
		}
		dataChannel.onclose = () => {
			console.log('Sender data channel closed')
		}
		setDataChannel(dataChannel)

		const localOffer = await localPeer.current.createOffer()
		await localPeer.current.setLocalDescription(localOffer)
	}

	const handleRemoteConnect = async (remoteDesc) => {
		if (!remoteDesc) {
			console.error('Remote desc is not set')
			return
		}
		try {
			const remoteOffer = remoteDesc
			await localPeer.current.setRemoteDescription(
				new RTCSessionDescription(remoteOffer),
			)
		} catch (error) {
			console.error('Error setting remote description', error)
		}
	}

	const createHistory = async (status) => {
		try {
			await axios.post('/api/messages/fileTransferHistory', {
				chatId: currentChat._id,
				senderId: user.id,
				fileName: file.name,
				fileSize: file.size,
				status: status,
			})
		} catch (error) {
			console.error('Error creating file transfer history', error)
		}
	}

	const handleSendFile = async () => {
		if (!file || !dataChannel) return
		setStatus(STATUS.SENDING)

		const chunkSize = 8192
		const fileReader = new FileReader()
		let offset = 0

		const sendChunk = (chunk) => {
			if (dataChannel.readyState === 'open') {
				dataChannel.send(chunk)
				offset += chunk.byteLength
				setProgress({ current: offset, total: file.size })

				if (offset < file.size) {
					if (
						dataChannel.bufferedAmount >
						dataChannel.bufferedAmountLowThreshold
					) {
						setTimeout(() => {
							readSlice(offset)
						}, 10)
					} else {
						readSlice(offset)
					}
				} else {
					dataChannel.send('END')
					setStatus(STATUS.DONE)
					createHistory('completed')
					clearAll()
				}
			} else {
				console.info('Data channel is not open')
			}
		}

		fileReader.onload = (e) => {
			if (
				dataChannel.bufferedAmount >
				dataChannel.bufferedAmountLowThreshold
			) {
				dataChannel.onbufferedamountlow = () => {
					sendChunk(e.target.result)
					dataChannel.onbufferedamountlow = null
				}
			} else {
				sendChunk(e.target.result)
			}
		}

		const readSlice = (o) => {
			const slice = file.slice(o, o + chunkSize)
			fileReader.readAsArrayBuffer(slice)
		}

		readSlice(0)
	}

	const clearAll = () => {
		if (dataChannel) {
			dataChannel.close()
		}
		if (localPeer.current) {
			localPeer.current.close()
		}
		setDataChannel(null)
		localPeer.current = null
	}

	const initPeer = async () => {
		try {
			localPeer.current = new RTCPeerConnection({
				iceServers: await getIceServers(),
			})
		} catch (error) {
			console.error('Error creating peer connection', error)
		}

		localPeer.current.onicecandidate = (event) => {
			if (event.candidate) {
				socket.emit('ice-candidate', event.candidate, targetId)
			}
		}

		localPeer.current.oniceconnectionstatechange = () => {
			console.log(
				'ICE connection state: ',
				localPeer.current.iceConnectionState,
			)
			if (localPeer.current.iceConnectionState === 'failed') {
				setStatus(STATUS.CANCELLED)
				toast.error(
					'File transfer error',
					'ICE connection failed',
					3000,
				)
			}
		}

		localPeer.current.onsignalingstatechange = () => {
			console.log('Signaling state: ', localPeer.current.signalingState)
		}

		localPeer.current.ondatachannel = (event) => {
			const receiveChannel = event.channel
			receiveChannel.binaryType = 'arraybuffer'
			receiveChannel.onmessage = handleReceiveFile
			receiveChannel.onopen = () => {
				console.log('Receiver data channel connected')
			}
			receiveChannel.onclose = () => {
				console.log('Receiver data channel closed')
			}
			receiveChannel.onerror = (error) => {
				console.error('Receiver data channel error: ', error)
			}
			setDataChannel(receiveChannel)
		}

		localPeer.current.onerror = (error) => {
			console.error('Peer connection error: ', error)
		}

		localPeer.current.onicecandidateerror = (error) => {
			console.error('ICE candidate error: ', error)
		}
	}

	useEffect(() => {
		initPeer()

		return () => {
			clearAll()
		}
	}, [])

	useEffect(() => {
		if (!socket) {
			console.error('Socket is not connected')
			return
		}

		socket.on('fileTransferError', (error) => {
			setStatus(STATUS.CANCELLED)
			console.log('File transfer error: ', error)
			toast.error(
				'File transfer error: ',
				typeof error === 'string'
					? error
					: 'An error occurred while setting up connection',
				4000,
			)
		})

		socket.on('fileTransferReject', () => {
			setStatus(STATUS.CANCELLED)
			toast.error(
				'File transfer rejected',
				'The receiver has rejected the file transfer',
				5000,
			)
		})

		socket.on('fileTransferAccept', () => {
			sendSenderDesc()
		})

		socket.on('receiverDesc', async (desc) => {
			await handleRemoteConnect(desc)
		})

		socket.on('ice-candidate', async (candidate) => {
			try {
				const iceCandidate = new RTCIceCandidate(candidate)
				setTimeout(async () => {
					await localPeer.current.addIceCandidate(iceCandidate)
				}, 500)
			} catch (error) {
				console.error(
					'Error adding received ICE candidate',
					'An error occurred while exchanging ICE candidates',
				)
			}
		})

		return () => {
			socket.off('fileTransferError')
			socket.off('fileTransferAccept')
			socket.off('fileReceiveReject')
			socket.off('receiverDesc')
			socket.off('ice-candidate')
		}
	}, [socket])

	useEffect(() => {
		if (!socket) {
			console.error('Socket is not connected')
			return
		}

		socket.on('fileTransferCancel', () => {
			clearAll()
			setStatus(STATUS.CANCELLED)
			createHistory('cancelled')
		})

		return () => {
			socket.off('fileTransferCancel')
		}
	}, [socket, file])

	useEffect(() => {
		if (isReady) {
			handleSendFile()
		}
	}, [isReady])

	if (!currentChat || !targetId) return null

	return (
		<div className="relative flex w-auto max-w-[95vw] flex-col items-center justify-center gap-2 rounded-lg bg-white px-8 py-4">
			<h1 className="pb-2 text-xl font-semibold">Transfer your file</h1>
			<button
				className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full text-lg hover:bg-gray-100"
				onClick={onClose}
			>
				<PiX />
			</button>
			{file ? (
				<div className="my-3 flex items-center gap-2">
					<div className="flex h-14 flex-1 items-center justify-center gap-4 rounded-lg border border-gray-300 px-4 py-2">
						<div className="flex size-6 items-center justify-center">
							<FileIcon ext={file?.name.split('.').pop()} />
						</div>

						<div className="">
							<p className="line-clamp-1 min-w-[252px] flex-1 text-sm font-semibold">
								{trimFilename(file?.name, 33)}
							</p>
							<p className="text-xs text-gray-600">
								{byteToMb(file?.size)} MB
							</p>
						</div>
					</div>
					<button
						className="flex size-6 items-center justify-center rounded-full bg-gray-100 text-sm text-red-700 transition-all hover:bg-gray-200 hover:text-red-500"
						onClick={() => setFile(null)}
					>
						<PiTrash />
					</button>
				</div>
			) : (
				<div
					className="relative my-3 flex w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-4"
					onDragOver={(e) => e.preventDefault()}
					onDrop={(e) => {
						e.preventDefault()
						if (e.dataTransfer.files && e.dataTransfer.files[0]) {
							setFile(e.dataTransfer.files[0])
						}
					}}
				>
					<p className="text-center text-gray-500">
						Drag & drop your file here, or click to select
					</p>
					<input
						className="absolute inset-0 cursor-pointer opacity-0"
						type="file"
						onChange={(e) => setFile(e.target.files[0])}
					/>
				</div>
			)}
			{status === STATUS.SENDING || status === STATUS.DONE ? (
				<>
					<div className="relative my-3 flex w-full items-center justify-center">
						<progress
							className="h-4 w-[280px] [&::-moz-progress-bar]:bg-violet-400 [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-bar]:bg-slate-300 [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-value]:bg-violet-400"
							value={progress.current || 0}
							max={progress.total || 1}
						/>
						<p className="absolute text-center text-xs">
							{progress.current > 0
								? `${byteToMb(progress.current)} / ${byteToMb(progress.total)} MB`
								: ''}
						</p>
					</div>
					<button
						className={`min-w-[160px] rounded px-3 py-1.5 text-white ${status === STATUS.DONE ? 'bg-sky-500' : 'bg-rose-500'}`}
						onClick={cancelFileTransfer}
					>
						{status === STATUS.DONE
							? 'Completed'
							: 'Cancel transfer'}
					</button>
				</>
			) : null}
			{[STATUS.NONE, STATUS.PENDING, STATUS.CONNECTING].includes(
				status,
			) ? (
				<button
					className="my-2 min-w-[160px] rounded bg-primary-400 px-3 py-1 text-[15px] text-white transition-colors hover:bg-primary-300 disabled:bg-primary-300"
					onClick={requestFileTransfer}
					disabled={!file || status !== STATUS.NONE}
				>
					{status}
				</button>
			) : null}
			{status === STATUS.CANCELLED ? (
				<div className="relative my-3 flex w-full items-center justify-center">
					<p className="font-semibold text-secondary-600">
						File transfer cancelled
					</p>
				</div>
			) : null}
		</div>
	)
}
