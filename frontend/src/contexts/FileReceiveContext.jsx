import axios from 'axios'
import { createContext, useEffect, useState } from 'react'
import FileReceiver from '../components/modal/FileReceiver'
import { useNotification } from '../hook/useNotification'
import { useSocket } from '../hook/useSocket'
import { byteToMb } from '../utils/format'
export const FileReceiveContext = createContext()

export const FileReceiveContextProvider = ({ children }) => {
	const { socket } = useSocket()
	const { titleNotify, windowNotify } = useNotification()
	const [fileReceiveOpen, setFileReceiveOpen] = useState(false)
	const [sender, setSender] = useState(null)
	const [metadata, setMetadata] = useState(null)

	const closeFileReceive = () => {
		setFileReceiveOpen(false)
		setSender(null)
		setMetadata(null)
	}

	const getSenderInfo = async (senderId) => {
		const res = await axios.get('/api/users/get', {
			params: {
				id: senderId,
			},
		})

		setSender(res.data.user)
	}

	useEffect(() => {
		if (!socket) return
		socket.on('fileTransferRequest', (metadata, senderId) => {
			setMetadata(metadata)
			getSenderInfo(senderId)
			setFileReceiveOpen(true)

			titleNotify('You have a file transfer request!')
			windowNotify(
				'You have a file transfer request!',
				`
        ${sender?.name || 'Someone'} wants to send you a file: ${metadata?.name} - ${byteToMb(metadata?.size)} MB`,
			)
		})

		return () => {
			socket.off('fileTransferRequest')
		}
	}, [socket])

	return (
		<FileReceiveContext.Provider
			value={{ sender, metadata, fileReceiveOpen }}
		>
			{fileReceiveOpen && sender && metadata && (
				<div
					className="fixed inset-0 z-[51] flex items-center justify-center bg-black/50"
					onClick={(e) => {
						if (e.target === e.currentTarget) {
							closeFileReceive()
						}
					}}
				>
					<FileReceiver
						sender={sender}
						metadata={metadata}
						onClose={closeFileReceive}
					/>
				</div>
			)}
			{children}
		</FileReceiveContext.Provider>
	)
}
