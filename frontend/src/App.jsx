import { Route, Routes, Navigate } from 'react-router'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Chat from './pages/Chat'
import { useAuth } from './hook/useAuth'
import { useEffect } from 'react'

function App() {
	const { auth, user } = useAuth()
	useEffect(() => {
		auth()
	}, [])

	return (
		<>
			{user ? (
				<Routes>
					<Route path="/:id" element={<Chat />} />
					<Route path="/" element={<Chat />} />
				</Routes>
			) : (
				<Routes>
					<Route path="/" element={<Login />} />
					<Route path="/register" element={<Register />} />
				</Routes>
			)}
		</>
	)
}

export default App
