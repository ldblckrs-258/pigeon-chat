import { Route, Routes } from 'react-router'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Chat from './pages/Chat'
import { useAuth } from './hook/useAuth'
import { useEffect } from 'react'
import VoiceCallPage from './pages/VoiceCall'
import VoiceCallGroup from './pages/VoiceCallGroup'
import EndCallPage from './pages/EndCall'
import ResendVerifyPage from './pages/ResendVerify'
import VerifyPage from './pages/Verify'
function App() {
	const { auth, user } = useAuth()
	useEffect(() => {
		auth()
	}, [])

	return (
		<>
			{user ? (
				user?.isVerified ? (
					<Routes>
						<Route path="/*" element={<Chat />} />
						<Route
							path="/voice-call/:chatId"
							element={<VoiceCallPage />}
						/>
						<Route
							path="/voice-call-group/:chatId"
							element={<VoiceCallGroup />}
						/>
						<Route path="/end-call" element={<EndCallPage />} />
					</Routes>
				) : (
					<Routes>
						<Route path="/verify-email" element={<VerifyPage />} />
						<Route path="/*" element={<ResendVerifyPage />} />
					</Routes>
				)
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
