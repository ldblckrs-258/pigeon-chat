import { useSocket } from '../hook/useSocket'
import { useEffect, useState, useRef } from 'react'

export default function FileTransfer({ id }) {
	const [file, setFile] = useState(null)
	const [dataChannel, setDataChannel] = useState(null)
	const localPeer = useRef(null) // Use useRef to persist localPeer across re-renders
	const [receivedFile, setReceivedFile] = useState(null)
	const [progress, setProgress] = useState({ current: 0, total: 0 })
	const [receivedMetadata, setReceivedMetadata] = useState(null)
	const { socket } = useSocket()
	const [isReady, setIsReady] = useState(false)

	const requestFileTransfer = () => {
		if (!file) {
			console.error('Please select a file')
			return
		}
		socket.emit('sendFileRequest', { name: file.name, size: file.size }, id)
	}

	const acceptFileTransfer = () => {
		socket.emit('fileReceiveAccept', id)
	}

	const sendSenderDesc = async () => {
		await handleLocalConnect()
		socket.emit(
			'senderDesc',
			JSON.stringify(localPeer.current.localDescription),
			id,
		)
	}

	const sendReceiverDesc = async (remoteDesc) => {
		await handleRemoteConnect(remoteDesc)
		socket.emit(
			'receiverDesc',
			JSON.stringify(localPeer.current.localDescription),
			id,
		)
	}

	const handleLocalConnect = async () => {
		const dataChannel = localPeer.current.createDataChannel('fileTransfer')
		dataChannel.binaryType = 'arraybuffer'
		dataChannel.onmessage = handleReceiveFile
		dataChannel.onopen = () => {
			setIsReady(true)
		}
		setDataChannel(dataChannel)

		// Sự kiện onicecandidate để thu thập ICE candidate
		localPeer.current.onicecandidate = (event) => {
			if (event.candidate) {
				socket.emit(
					'ice-candidate',
					JSON.stringify(event.candidate),
					id,
				)
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
			const remoteOffer = JSON.parse(remoteDesc)
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

			// Sự kiện onicecandidate cho receiver để gửi candidate
			localPeer.current.onicecandidate = (event) => {
				if (event.candidate) {
					socket.emit(
						'ice-candidate',
						JSON.stringify(event.candidate),
						id,
					)
				}
			}
		} catch (error) {
			console.error('Error setting remote description', error)
		}
	}

	const handleSendFile = async () => {
		if (!file || !dataChannel) return

		const chunkSize = 16384
		const fileReader = new FileReader()
		let offset = 0

		const sendChunk = (chunk) => {
			if (dataChannel.readyState === 'open') {
				dataChannel.send(chunk)
				offset += chunk.byteLength
				setProgress({ current: offset, total: file.size })

				if (offset < file.size) {
					readSlice(offset)
				} else {
					dataChannel.send('END')
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

	let receiveBuffer = []

	const handleReceiveFile = (event) => {
		const receivedData = event.data
		setProgress((prev) => ({
			...prev,
			current: prev.current + receivedData.byteLength,
		}))
		if (receivedData === 'END') {
			setProgress((prev) => ({ ...prev, current: prev.total }))
			const receivedBlob = new Blob(receiveBuffer)
			setReceivedFile(receivedBlob)
			alert('File received')
			receiveBuffer = []
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

		console.log('Local peer created')
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
			console.error(error)
		})

		socket.on('fileTransferRequest', (metadata) => {
			setReceivedMetadata(metadata)

			let confirm = window.confirm(
				`Accept file ${metadata.name} - ${metadata.size}?`,
			)

			if (confirm) {
				setProgress({ current: 0, total: metadata.size })
				acceptFileTransfer()
			} else {
				console.info('File transfer request declined')
			}
		})

		socket.on('fileTransferAccept', () => {
			sendSenderDesc()
		})

		socket.on('senderDesc', async (desc) => {
			await sendReceiverDesc(desc)
		})

		socket.on('receiverDesc', async (desc) => {
			await handleRemoteConnect(desc)
		})

		socket.on('ice-candidate', async (candidate) => {
			try {
				const iceCandidate = new RTCIceCandidate(JSON.parse(candidate))
				await localPeer.current.addIceCandidate(iceCandidate)
			} catch (error) {
				console.error('Error adding received ICE candidate', error)
			}
		})

		return () => {
			socket.off('fileTransferError')
			socket.off('fileTransferRequest')
			socket.off('fileTransferAccept')
			socket.off('senderDesc')
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
		<div className="flex w-full flex-col items-center justify-center gap-2">
			<input
				className="rounded border border-gray-300 px-4 py-2"
				type="file"
				onChange={(e) => setFile(e.target.files[0])}
			/>
			<button
				className="mb-3 mt-1 rounded bg-blue-500 px-3 py-1 text-white"
				onClick={requestFileTransfer}
			>
				Send file
			</button>
			<div className="relative flex w-full items-center justify-center">
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

			{receivedFile && (
				<a
					className="text-sm hover:underline"
					href={URL.createObjectURL(receivedFile)}
					download={receivedMetadata?.name}
				>
					{receivedMetadata?.name}
				</a>
			)}
		</div>
	)
}
