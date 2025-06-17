import { useSocket } from '@hooks/useSocket'
import { useToast } from '@hooks/useToast'
import useWindowSize from '@hooks/useWindowSize'
import { byteToMb, trimFilename } from '@utils/format'
import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { PiArrowsDownUpBold, PiX } from 'react-icons/pi'
import FileIcon from '../FileIcon'
import { STATUS } from './constants'

export default function FileReceiver({ sender, metadata, onClose }) {
	console.log('sender', sender)
	const [status, setStatus] = useState(STATUS.PENDING)
	const [dataChannel, setDataChannel] = useState(null)
	const { width } = useWindowSize()
	const localPeer = useRef(null)
	const [progress, setProgress] = useState({
		current: 0,
		total: metadata.size,
	})
	const { socket } = useSocket()
	const toast = useToast()

	const getIceServers = async () => {
		try {
			const response = await axios.get(
				'/api/tools/ice-servers?types=private,cloudflare',
			)
			return response.data.data
		} catch (error) {
			console.error('Error getting ICE servers', error)
			return []
		}
	}

	const acceptFileTransfer = async () => {
		setStatus(STATUS.CONNECTING)
		await initPeer()
		socket.emit('fileReceiveAccept', sender._id)
	}

	const rejectFileTransfer = () => {
		socket.emit('fileReceiveReject', sender._id)
		onClose()
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
			setStatus(STATUS.CANCELLED)
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
		try {
			localPeer.current = new RTCPeerConnection({
				iceServers: await getIceServers(),
			})
		} catch (error) {
			console.error('Error creating peer connection', error)
		}

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
				setStatus(STATUS.CANCELLED)
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
				setStatus(STATUS.SENDING)
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
			setStatus(STATUS.CANCELLED)
		}

		localPeer.current.onicecandidateerror = (error) => {
			console.error('ICE candidate error: ', error)
		}
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

	useEffect(() => {
		if (!socket) {
			console.error('Socket is not connected')
			return
		}

		socket.on('fileTransferError', (error) => {
			setStatus(STATUS.CANCELLED)
			toast.error(
				"Can't receive file",
				typeof error === 'string'
					? error
					: 'An error occurred while setting up connection',
				3000,
			)
		})

		socket.on('senderDesc', async (desc) => {
			await sendReceiverDesc(desc)
		})

		socket.on('ice-candidate', async (candidate) => {
			try {
				const iceCandidate = new RTCIceCandidate(candidate)
				setTimeout(async () => {
					await localPeer.current.addIceCandidate(iceCandidate)
				}, 200)
			} catch (error) {
				setStatus(STATUS.CANCELLED)
				console.error('Error adding received ICE candidate', error)
				toast.error(
					'File transfer error',
					'An error occurred while exchanging ICE candidate',
					2500,
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

	useEffect(() => {
		return () => {
			clearAll()
		}
	}, [])

	return (
		<div className="~px-6/12 relative flex w-auto max-w-[90vw] flex-col items-center justify-center gap-2 rounded-lg bg-white py-4">
			<button
				className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full text-lg hover:bg-gray-100"
				onClick={onClose}
			>
				<PiX />
			</button>
			<h1 className="pb-3 text-xl font-semibold">
				Receive file transfer
			</h1>
			<div className="flex w-full items-center justify-center gap-4 rounded-lg border border-gray-300 px-4 py-2">
				<div className="flex items-center justify-center">
					<img
						src={sender?.avatar}
						alt="avatar"
						className="size-8 rounded-full"
					/>
				</div>

				<p className="font-semibold">{sender?.name}</p>
			</div>
			<div className="text-center text-xl text-primary-500">
				<PiArrowsDownUpBold />
			</div>
			<div className="w-full space-y-2 py-1 text-sm">
				<div className="flex h-14 flex-1 items-center justify-center gap-4 rounded-lg border border-gray-300 px-4 py-2">
					<div className="flex size-6 items-center justify-center">
						<FileIcon ext={metadata?.name.split('.').pop()} />
					</div>

					<div className="flex-1 overflow-hidden">
						<p className="line-clamp-1 text-sm font-semibold">
							{trimFilename(
								metadata?.name,
								width < 448 ? 20 : width < 720 ? 24 : 32,
							)}
						</p>
						<p className="text-xs text-gray-600">
							{byteToMb(metadata?.size)} MB
						</p>
					</div>
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

			<div className="my-2 flex items-center justify-center gap-6">
				{status === STATUS.PENDING ? (
					<>
						<button
							className="rounded bg-secondary-500 px-5 py-1 text-[15px] text-white transition-colors hover:bg-secondary-400"
							onClick={rejectFileTransfer}
						>
							Reject
						</button>
						<button
							className="rounded bg-primary-400 px-3 py-1 text-[15px] text-white transition-colors hover:bg-primary-300"
							onClick={acceptFileTransfer}
						>
							Accept & Download
						</button>
					</>
				) : null}
				{status === STATUS.CANCELLED ? (
					<div className="relative flex w-full items-center justify-center">
						<p className="font-semibold text-secondary-600">
							File transfer cancelled
						</p>
					</div>
				) : null}
			</div>
		</div>
	)
}
