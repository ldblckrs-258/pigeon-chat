import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import SpinLoader from '../components/SpinLoader'
import TextField from '../components/TextField'
import { useToast } from '../hook/useToast'

const ResetPassword = () => {
	const [formData, setFormData] = useState({
		newPassword: '',
		confirmPassword: '',
	})
	const [formError, setFormError] = useState({
		newPassword: '',
		confirmPassword: '',
	})
	const [isLoading, setIsLoading] = useState(false)
	const [isTokenValid, setIsTokenValid] = useState(true)
	const [searchParams] = useSearchParams()
	const token = searchParams.get('token')
	const toast = useToast()
	const navigate = useNavigate()

	useEffect(() => {
		// Check if token exists
		if (!token) {
			setIsTokenValid(false)
			toast.error('Invalid Link', 'Password reset token is missing', 5000)
		}
	}, [token, toast])

	const validate = () => {
		let errors = { newPassword: '', confirmPassword: '' }
		let isValid = true

		// Password validation
		if (formData.newPassword === '') {
			errors.newPassword = 'New password is required'
			isValid = false
		} else if (formData.newPassword.length < 8) {
			errors.newPassword = 'Password must be at least 8 characters'
			isValid = false
		} else if (
			!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,}$/.test(
				formData.newPassword,
			)
		) {
			errors.newPassword =
				'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 symbol'
			isValid = false
		}

		// Confirm password validation
		if (formData.confirmPassword === '') {
			errors.confirmPassword = 'Please confirm your password'
			isValid = false
		} else if (formData.newPassword !== formData.confirmPassword) {
			errors.confirmPassword = 'Passwords do not match'
			isValid = false
		}

		setFormError(errors)
		return isValid
	}

	const handleSubmit = async () => {
		const isValid = validate()
		if (!isValid) {
			toast.error(
				'Validation failed',
				'Please check your form data',
				3000,
			)
			return
		}

		setIsLoading(true)
		try {
			const response = await axios.post('/api/auth/reset-password', {
				token,
				newPassword: formData.newPassword,
			})

			toast.success('Success', response.data.message, 5000)

			// Redirect to login after successful reset
			setTimeout(() => {
				navigate('/login')
			}, 2000)
		} catch (err) {
			const errorMessage =
				err.response?.data?.message || 'Failed to reset password'
			toast.error('Error', errorMessage, 5000)

			// If token is expired or invalid, redirect to forgot password
			if (
				errorMessage.includes('expired') ||
				errorMessage.includes('invalid')
			) {
				setTimeout(() => {
					navigate('/forgot-password')
				}, 3000)
			}
		}
		setIsLoading(false)
	}

	if (!isTokenValid) {
		return (
			<div className="relative flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-secondary-50 to-primary-100">
				<div className="z-10 mx-4 flex w-[420px] flex-col items-center rounded-lg border border-gray-300 bg-white px-6 py-8">
					<h2 className="mb-4 text-xl font-semibold text-red-600">
						Invalid Reset Link
					</h2>
					<p className="mb-6 text-center text-sm text-gray-700">
						This password reset link is invalid or has expired.
						Please request a new one.
					</p>
					<button
						className="h-10 w-full rounded bg-primary-500 font-semibold tracking-wide text-white transition-colors hover:bg-primary-400 active:bg-primary-600"
						onClick={() => navigate('/forgot-password')}
					>
						Request New Reset Link
					</button>
					<button
						className="mt-3 flex h-10 w-full items-center justify-center gap-1 rounded border border-gray-300 text-sm font-semibold tracking-wide text-gray-700 transition-all hover:ring-1"
						onClick={() => navigate('/login')}
					>
						Back to Login
					</button>
				</div>
				<div>
					<section className="absolute left-8 top-12 rounded-full bg-secondary-100 blur-[80px] lg:h-[280px] lg:w-[440px]"></section>
					<section className="absolute bottom-4 right-8 rounded-full bg-primary-100 blur-[80px] lg:h-[320px] lg:w-[520px]"></section>
				</div>
			</div>
		)
	}

	return (
		<div className="relative flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-secondary-50 to-primary-100">
			<div className="z-10 mx-4 flex w-[420px] flex-col items-center rounded-lg border border-gray-300 bg-white px-6 py-8">
				<h2 className="mb-4 text-xl font-semibold text-gray-800">
					Reset Password
				</h2>
				<p className="mb-6 text-center text-sm text-gray-700">
					Enter your new password below.
				</p>

				<TextField
					className="mt-4 w-full"
					label="New Password"
					type="password"
					value={formData.newPassword}
					maxLength={100}
					onChange={(e) => {
						setFormData({
							...formData,
							newPassword: e.target.value,
						})
						setFormError({ ...formError, newPassword: '' })
					}}
					onEnter={handleSubmit}
					error={formError.newPassword !== ''}
				/>
				<p className="mt-1 w-full text-left text-xs text-red-600">
					{formError.newPassword}
				</p>

				<TextField
					className="mt-4 w-full"
					label="Confirm New Password"
					type="password"
					value={formData.confirmPassword}
					maxLength={100}
					onChange={(e) => {
						setFormData({
							...formData,
							confirmPassword: e.target.value,
						})
						setFormError({ ...formError, confirmPassword: '' })
					}}
					onEnter={handleSubmit}
					error={formError.confirmPassword !== ''}
				/>
				<p className="mt-1 w-full text-left text-xs text-red-600">
					{formError.confirmPassword}
				</p>

				<button
					className="mt-6 h-10 w-full rounded bg-primary-500 font-semibold tracking-wide text-white transition-colors hover:bg-primary-400 active:bg-primary-600 disabled:opacity-70"
					onClick={handleSubmit}
					disabled={isLoading}
				>
					{isLoading ? (
						<SpinLoader className="mx-auto size-5" />
					) : (
						'Reset Password'
					)}
				</button>

				<button
					className="mt-3 flex h-10 w-full items-center justify-center gap-1 rounded border border-gray-300 text-sm font-semibold tracking-wide text-gray-700 transition-all hover:ring-1"
					onClick={() => navigate('/login')}
				>
					Back to Login
				</button>
			</div>
			<div>
				<section className="absolute left-8 top-12 rounded-full bg-secondary-100 blur-[80px] lg:h-[280px] lg:w-[440px]"></section>
				<section className="absolute bottom-4 right-8 rounded-full bg-primary-100 blur-[80px] lg:h-[320px] lg:w-[520px]"></section>
			</div>
		</div>
	)
}

export default ResetPassword
