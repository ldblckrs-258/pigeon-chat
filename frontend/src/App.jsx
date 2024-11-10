import { Route, Routes } from 'react-router'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Chat from './pages/Chat'
import { useAuth } from './hook/useAuth'
import { useEffect } from 'react'
import { useSocket } from './hook/useSocket'
import VoiceCallPage from './pages/VoiceCall'
import VideoCallPage from './pages/VideoCall'
function App() {
	const { auth, user } = useAuth()
	const { onlineUsers, socket } = useSocket()
	useEffect(() => {
		auth()
	}, [])

	return (
		<>
			{user ? (
				<Routes>
					<Route path="/*" element={<Chat />} />
					<Route
						path="/voice-call/:chatId"
						element={<VoiceCallPage />}
					/>
					<Route
						path="/video-call/:chatId"
						element={<VideoCallPage />}
					/>
					<Route path="/blank" element={<div></div>} />
				</Routes>
			) : (
				<Routes>
					<Route path="/*" element={<Login />} />
					<Route path="/register" element={<Register />} />
				</Routes>
			)}
		</>
	)
}

export default App
