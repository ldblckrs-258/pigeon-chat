import { useSocket } from '../../hook/useSocket'
import { useEffect, useState, useRef } from 'react'
import { PiX } from 'react-icons/pi'
import { useToast } from '../../hook/useToast'
import { iceServers } from '../../configs/iceServers'
import { useAuth } from '../../hook/useAuth'
import { STATUS } from './constants'

export default function FileReceiver({ sender, metadata, onClose }) {
	const { user } = useAuth()
	const [status, setStatus] = useState(STATUS.PENDING)
	const [dataChannel, setDataChannel] = useState(null)
	const localPeer = useRef(null)
	const [progress, setProgress] = useState({
		current: 0,
		total: metadata.size,
	})
	const { socket } = useSocket()
	const toast = useToast()

	const acceptFileTransfer = () => {
		setStatus(STATUS.CONNECTING)
		socket.emit('fileReceiveAccept', sender._id)
	}

	const cancelFileTransfer = () => {
		if (status === STATUS.DONE) {
			onClose()
			return
		}
		setStatus(STATUS.CANCELLED)
		clearAll()
		socket.emit('fileTransferCancel', sender._id)
	}

	const sendReceiverDesc = async (remoteDesc) => {
		await handleRemoteConnect(remoteDesc)
		socket.emit(
			'receiverDesc',
			localPeer.current.localDescription,
			sender._id,
		)
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
			if (localPeer.current.signalingState === 'have-remote-offer') {
				let answer = await localPeer.current.createAnswer()
				await localPeer.current.setLocalDescription(answer)
			}
		} catch (error) {
			console.error('Error setting remote description', error)
			toast.error('File transfer error', "Can't set remote description")
		}
	}

	let receiveBuffer = []

	const handleReceiveFile = (event) => {
		const receivedData = event.data
		setProgress((prev) => ({
			...prev,
			current: prev.current + receivedData.byteLength,
		}))
		if (typeof receivedData === 'string' && receivedData === 'END') {
			setProgress((prev) => ({ ...prev, current: prev.total }))
			const receivedBlob = new Blob(receiveBuffer)

			const url = URL.createObjectURL(receivedBlob)
			const a = document.createElement('a')
			a.href = url
			a.download = metadata.name
			a.click()
			setStatus(STATUS.DONE)
			clearAll()
			return
		}

		receiveBuffer.push(receivedData)
	}

	const initPeer = async () => {
		localPeer.current = new RTCPeerConnection({
			iceServers: iceServers,
		})

		localPeer.current.onicecandidate = (event) => {
			if (event.candidate) {
				socket.emit('ice-candidate', event.candidate, sender._id)
			}
		}

		localPeer.current.oniceconnectionstatechange = () => {
			console.log(
				'ICE connection state: ',
				localPeer.current.iceConnectionState,
			)
			if (localPeer.current.iceConnectionState === 'failed') {
				toast.error('File transfer error', 'ICE connection failed')
			}
		}

		localPeer.current.onsignalingstatechange = () => {
			console.log('Signaling state: ', localPeer.current.signalingState)
			if (localPeer.current.signalingState === 'closed') {
				toast.info('File transfer info', 'Signaling state closed')
			}
		}

		localPeer.current.ondatachannel = (event) => {
			const receiveChannel = event.channel
			receiveChannel.binaryType = 'arraybuffer'
			receiveChannel.onmessage = handleReceiveFile
			receiveChannel.onopen = () => {
				setStatus(STATUS.SENDING)
				console.log('Receiver data channel connected')
			}
			receiveChannel.onclose = () => {
				console.log('Receiver data channel closed')
			}
			receiveChannel.onerror = (error) => {
				console.error('Receiver data channel error: ', error)
				toast.error(
					'File transfer error',
					'An error occurred while receiving file',
				)
			}
			setDataChannel(receiveChannel)
		}

		localPeer.current.onerror = (error) => {
			console.error('Peer connection error: ', error)
			toast.error(
				'File transfer error',
				'An error occurred while receiving file',
			)
		}
	}

	const clearAll = () => {
		setDataChannel(null)
		localPeer.current.close()
		localPeer.current = null
		receiveBuffer = []
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
			toast.error(
				"Can't receive file",
				typeof error === 'string'
					? error
					: 'An error occurred while setting up connection',
			)
		})

		socket.on('senderDesc', async (desc) => {
			await sendReceiverDesc(desc)
		})

		socket.on('ice-candidate', async (candidate) => {
			try {
				const iceCandidate = new RTCIceCandidate(candidate)
				await localPeer.current.addIceCandidate(iceCandidate)
			} catch (error) {
				console.error('Error adding received ICE candidate', error)
				toast.error(
					'File transfer error',
					'An error occurred while exchanging ICE candidate',
				)
			}
		})

		socket.on('fileTransferCancel', () => {
			clearAll()
			setStatus(STATUS.CANCELLED)
		})

		return () => {
			socket.off('fileTransferError')
			socket.off('senderDesc')
			socket.off('ice-candidate')
			socket.off('fileTransferCancel')
		}
	}, [socket])

	return (
		<div className="relative flex w-auto max-w-[90vw] flex-col items-center justify-center gap-2 rounded-lg bg-white px-12 py-4">
			<button
				className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full text-lg hover:bg-gray-100"
				onClick={onClose}
			>
				<PiX />
			</button>
			<h1 className="text-center text-xl font-semibold">
				Receive file transfer
			</h1>
			<div className="w-full py-1 text-sm">
				<div className="flex items-center gap-2">
					<p className="font-semibold">Sender:</p>
					<p>{sender?.name || 'Unknown'}</p>
				</div>
				<div className="flex items-center gap-2">
					<p className="font-semibold">File name:</p>
					<p className="line-clamp-1 flex-1">
						{metadata?.name || 'Temp file'}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<p className="font-semibold">Size:</p>
					<p>{(metadata?.size / 1000 / 1024 || 0).toFixed(2)} MB</p>
				</div>
			</div>
			{[STATUS.CONNECTING, STATUS.SENDING, STATUS.DONE].includes(
				status,
			) ? (
				<>
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

			{status === STATUS.PENDING ? (
				<button
					className="my-3 rounded bg-blue-500 px-3 py-1 text-white"
					onClick={acceptFileTransfer}
				>
					Accept and download
				</button>
			) : null}
			{status === STATUS.CANCELLED ? (
				<div className="relative my-3 flex w-full items-center justify-center">
					<p className="font-semibold text-red-500">
						File transfer cancelled
					</p>
				</div>
			) : null}
		</div>
	)
}
