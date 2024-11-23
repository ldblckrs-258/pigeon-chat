import { useEffect } from 'react'
import axios from 'axios'
import SpinLoader from '../components/SpinLoader'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useToast } from '../hook/useToast'
const VerifyPage = () => {
	const [searchParams, setSearchParams] = useSearchParams()
	const navigate = useNavigate()
	const toast = useToast()
	const verifyEmail = async () => {
		const token = searchParams.get('token')
		if (!token) {
			toast.error('Invalid token', 'Token is required', 5000)
			navigate('/')
		}
		try {
			await axios.post(`/api/auth/verify-email?token=${token}`)
			navigate('/')
			window.location.reload()
		} catch (err) {
			toast.error(
				'Invalid token',
				'Token is invalid or expired, please resend',
				5000,
			)
			navigate('/')
		}
	}

	useEffect(() => {
		verifyEmail()
	}, [])

	return (
		<div className="relative flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-secondary-50 to-primary-100">
			<SpinLoader className="size-20" />
		</div>
	)
}

export default VerifyPage
