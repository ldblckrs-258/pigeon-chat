import { useEffect } from 'react'
import { useSocket } from '../hook/useSocket'

const EndCallPage = () => {
	const { socket } = useSocket()
	useEffect(() => {
		if (!socket) return
		socket.close()
		return () => {
			socket.offAny()
		}
	}, [socket])
	return (
		<main className="relative flex h-dvh w-screen select-none flex-col items-center justify-center bg-primary-50 px-20">
			<h3 className="text-center text-4xl font-bold text-primary-800">
				The calling is ended.
			</h3>
			<p className="mt-1 text-center text-base text-gray-700">
				You can close this window now
			</p>
		</main>
	)
}

export default EndCallPage
