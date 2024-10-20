import { useSocket } from '../hook/useSocket'
import { useEffect, useState, useRef } from 'react'
import { PiX } from 'react-icons/pi'
import { useToast } from '../hook/useToast'

const STATUS = {
	NONE: 'Send file',
	PENDING: 'Pending request',
	CONNECTING: 'Connecting',
	SENDING: 'Sending',
	DONE: 'Done',
}

export default function FileSender({ id, onClose }) {
	const [file, setFile] = useState(null)
	const [dataChannel, setDataChannel] = useState(null)
	const localPeer = useRef(null)
	const [progress, setProgress] = useState({ current: 0, total: 0 })
	const { socket } = useSocket()
	const { toast } = useToast()
	const [isReady, setIsReady] = useState(false)
	const [status, setStatus] = useState(STATUS.NONE)

	const requestFileTransfer = () => {
		if (!file) {
			console.error('Please select a file')
			return
		}
		socket.emit('sendFileRequest', { name: file.name, size: file.size }, id)
		setStatus(STATUS.PENDING)
	}

	const sendSenderDesc = async () => {
		await handleLocalConnect()
		socket.emit('senderDesc', localPeer.current.localDescription, id)
		setStatus(STATUS.CONNECTING)
	}

	const handleLocalConnect = async () => {
		const dataChannel = localPeer.current.createDataChannel('fileTransfer')
		dataChannel.binaryType = 'arraybuffer'
		dataChannel.onopen = () => {
			console.log('Sender data channel connected')
			setIsReady(true)
		}
		setDataChannel(dataChannel)

		localPeer.current.onicecandidate = (event) => {
			if (event.candidate) {
				socket.emit('ice-candidate', event.candidate, id)
			}
		}

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

	const handleSendFile = async () => {
		if (!file || !dataChannel) return
		setStatus(STATUS.SENDING)

		const chunkSize = 8192
		const fileReader = new FileReader()
		let offset = 0

		const sendChunk = (chunk) => {
			console.log('send-chunk', offset)
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
					clearAll()
				}
			} else {
				console.error('Data channel is not open')
			}
		}

		fileReader.onload = (e) => {
			if (
				dataChannel.bufferedAmount >
				dataChannel.bufferedAmountLowThreshold
			) {
				dataChannel.onbufferedamountlow = () => {
					sendChunk(e.target.result)
					dataChannel.onbufferedamountlow = null // Clear the event handler
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
		setDataChannel(null)
		localPeer.current.close()
		localPeer.current = null
	}

	const initPeer = async () => {
		localPeer.current = new RTCPeerConnection({
			iceServers: [
				{ urls: 'stun:freestun.net:3479' },
				{
					urls: 'turn:freestun.net:3479',
					username: 'free',
					credential: 'free',
				},
			],
		})
	}

	useEffect(() => {
		initPeer()
	}, [])

	useEffect(() => {
		if (!socket) {
			console.error('Socket is not connected')
			return
		}

		socket.on('fileTransferError', (error) => {
			toast.error(error)
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
				await localPeer.current.addIceCandidate(iceCandidate)
			} catch (error) {
				console.error('Error adding received ICE candidate', error)
			}
		})

		return () => {
			socket.off('fileTransferError')
			socket.off('fileTransferAccept')
			socket.off('receiverDesc')
			socket.off('ice-candidate')
		}
	}, [socket])

	useEffect(() => {
		if (isReady) {
			handleSendFile()
		}
	}, [isReady])

	return (
		<div className="relative flex w-auto max-w-[95vw] flex-col items-center justify-center gap-2 rounded-lg bg-white px-8 py-4">
			<h1 className="pb-2 text-xl font-semibold">Transfer your file</h1>
			<button
				className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full text-lg hover:bg-gray-100"
				onClick={onClose}
			>
				<PiX />
			</button>
			<input
				className="rounded border border-gray-300 px-4 py-2"
				type="file"
				onChange={(e) => setFile(e.target.files[0])}
			/>
			{status === STATUS.SENDING || status === STATUS.DONE ? (
				<div className="relative my-3 flex w-full items-center justify-center">
					<progress
						className="h-4 w-[280px] [&::-moz-progress-bar]:bg-violet-400 [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-bar]:bg-slate-300 [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-value]:bg-violet-400"
						value={progress.current || 0}
						max={progress.total || 1}
					/>
					<p className="absolute text-center text-xs">
						{progress.current > 0
							? `${(progress.current / 1000 / 1024).toFixed(2)} / ${(progress.total / 1000 / 1024).toFixed(2)} MB`
							: ''}
					</p>
				</div>
			) : (
				<button
					className="my-3 min-w-[160px] rounded bg-blue-500 px-3 py-1.5 text-white disabled:bg-blue-500/70"
					onClick={requestFileTransfer}
					disabled={!file || status !== STATUS.NONE}
				>
					{status}
				</button>
			)}
		</div>
	)
}
