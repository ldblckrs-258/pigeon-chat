import { useSocket } from '../hook/useSocket'
import { useEffect, useState, useRef } from 'react'
import { PiX } from 'react-icons/pi'
import { useToast } from '../hook/useToast'

export default function FileReceiver({ sender, metadata, onClose }) {
	const [dataChannel, setDataChannel] = useState(null)
	const localPeer = useRef(null)
	const [progress, setProgress] = useState({
		current: 0,
		total: metadata.size,
	})
	const { socket } = useSocket()
	const { toast } = useToast()
	const [isAccepted, setIsAccepted] = useState(false)

	const acceptFileTransfer = () => {
		setIsAccepted(true)
		socket.emit('fileReceiveAccept', sender._id)
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

			localPeer.current.ondatachannel = (event) => {
				const receiveChannel = event.channel
				receiveChannel.binaryType = 'arraybuffer'
				receiveChannel.onmessage = handleReceiveFile
				receiveChannel.onopen = () => {
					console.log('Receiver data channel connected')
				}
				setDataChannel(receiveChannel)
			}

			localPeer.current.onicecandidate = (event) => {
				if (event.candidate) {
					socket.emit('ice-candidate', event.candidate, sender._id)
				}
			}
		} catch (error) {
			console.error('Error setting remote description', error)
		}
	}

	let receiveBuffer = []

	const handleReceiveFile = (event) => {
		const receivedData = event.data
		setProgress((prev) => ({
			...prev,
			current: prev.current + receivedData.byteLength,
		}))
		console.log('progress', progress.current + receivedData.byteLength)
		if (typeof receivedData === 'string' && receivedData === 'END') {
			setProgress((prev) => ({ ...prev, current: prev.total }))
			const receivedBlob = new Blob(receiveBuffer)

			const url = URL.createObjectURL(receivedBlob)
			const a = document.createElement('a')
			a.href = url
			a.download = metadata.name
			a.click()

			clearAll()
			return
		}

		receiveBuffer.push(receivedData)
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
			toast.error(error)
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
			}
		})

		return () => {
			socket.off('fileTransferError')
			socket.off('senderDesc')
			socket.off('ice-candidate')
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
			{isAccepted ? (
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
					className="my-3 rounded bg-blue-500 px-3 py-1 text-white"
					onClick={acceptFileTransfer}
				>
					Accept and download
				</button>
			)}
		</div>
	)
}
