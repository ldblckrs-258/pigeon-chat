import { AuthContext } from '@contexts/AuthContext'
import axios from 'axios'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import useLoader from './useLoader'
import { useToast } from './useToast'

export const useAuth = () => {
	const { user, setUser } = useContext(AuthContext)
	const { setLoading } = useLoader()
	const toast = useToast()
	const navigate = useNavigate()

	const login = async (email, password, isRemember) => {
		try {
			const res = await axios.post('/api/auth/login', {
				email,
				password,
				isRemember,
			})
			setUser(res.data.user)
			toast.success(
				'Login successful',
				`Welcome back, ${res.data.user.name}`,
				2000,
			)
		} catch (err) {
			toast.error('Login failed', err.response?.data?.message, 5000)
		}
	}

	const register = async (name, email, password) => {
		try {
			const res = await axios.post('/api/auth/register', {
				name,
				email,
				password,
			})
			setUser(res.data.user)
			toast.success('Success', 'Register successful', 2000)
			navigate('/')
			return true
		} catch (err) {
			toast.error('Register failed', err.response?.data?.message, 5000)
			return false
		}
	}

	const logout = async () => {
		try {
			await axios.get('/api/auth/logout')
			setUser(null)
			toast.success('Logout successful', 'Goodbye, see you later', 2000)
			navigate('/')
		} catch (err) {
			toast.error('Logout failed', err.response?.data?.message, 5000)
		}
	}

	const auth = async () => {
		setLoading(true)
		try {
			const res = await axios.get('/api/auth')
			setUser(res.data.user)
		} catch (err) {
			toast.info('Welcome', 'Please login to continue', 3000)
		}
		setLoading(false)
	}

	const googleLogin = async (access_token, isRemember) => {
		try {
			const res = await axios.post('/api/auth/google', {
				access_token,
				isRemember,
			})
			setUser(res.data?.user)
			toast.success(
				'Login successful',
				`Welcome back, ${res.data.user.name}`,
				2000,
			)
		} catch (err) {
			toast.error('Login failed', err.response?.data?.message, 5000)
		}
	}

	return { login, googleLogin, register, logout, auth, user }
}
