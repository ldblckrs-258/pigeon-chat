import axios from 'axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SpinLoader from '../components/SpinLoader'
import TextField from '../components/TextField'
import { useToast } from '../hook/useToast'

const ForgotPassword = () => {
	const [email, setEmail] = useState('')
	const [emailError, setEmailError] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [isEmailSent, setIsEmailSent] = useState(false)
	const [isDisabled, setIsDisabled] = useState(false)
	const [remainingTime, setRemainingTime] = useState(60)
	const toast = useToast()
	const navigate = useNavigate()

	const validate = () => {
		if (email === '') {
			setEmailError('Email is required')
			return false
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			setEmailError('Email is not valid')
			return false
		}
		setEmailError('')
		return true
	}

	const handleSubmit = async () => {
		const isValid = validate()
		if (!isValid) {
			toast.error(
				'Validation failed',
				'Please check your email address',
				3000,
			)
			return
		}

		setIsLoading(true)
		try {
			const response = await axios.post('/api/auth/forgot-password', {
				email,
			})
			setIsEmailSent(true)
			setIsDisabled(true)
			toast.success('Success', response.data.message, 5000)

			// Start countdown timer
			setRemainingTime(60)
			const interval = setInterval(() => {
				setRemainingTime((prev) => {
					if (prev <= 1) {
						clearInterval(interval)
						setIsDisabled(false)
						return 0
					}
					return prev - 1
				})
			}, 1000)
		} catch (err) {
			toast.error(
				'Error',
				err.response?.data?.message || 'Failed to send reset email',
				5000,
			)
		}
		setIsLoading(false)
	}

	const handleResend = async () => {
		await handleSubmit()
	}

	const maskedEmail = email.replace(/(?<=.{3}).(?=[^@]*?.@)/g, '*')

	return (
		<div className="relative flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-secondary-50 to-primary-100">
			<div className="z-10 mx-4 flex w-[420px] flex-col items-center rounded-lg border border-gray-300 bg-white px-6 py-8">
				{!isEmailSent ? (
					<>
						<h2 className="mb-4 text-xl font-semibold text-gray-800">
							Forgot Password
						</h2>
						<p className="mb-6 text-center text-sm text-gray-700">
							Enter your email address and we'll send you a link
							to reset your password.
						</p>

						<TextField
							className="mt-4 w-full"
							label="Email"
							type="email"
							value={email}
							maxLength={50}
							onChange={(e) => {
								setEmail(e.target.value)
								setEmailError('')
							}}
							onEnter={handleSubmit}
							error={emailError !== ''}
						/>
						<p className="mt-1 w-full text-left text-xs text-red-600">
							{emailError}
						</p>

						<button
							className="mt-6 h-10 w-full rounded bg-primary-500 font-semibold tracking-wide text-white transition-colors hover:bg-primary-400 active:bg-primary-600 disabled:opacity-70"
							onClick={handleSubmit}
							disabled={isLoading}
						>
							{isLoading ? (
								<SpinLoader className="mx-auto size-5" />
							) : (
								'Send Reset Email'
							)}
						</button>
					</>
				) : (
					<>
						<h2 className="mb-4 text-xl font-semibold text-gray-800">
							Check Your Email
						</h2>
						<p className="mb-4 text-center text-sm text-gray-700">
							We've sent a password reset link to{' '}
							<span className="font-semibold">{maskedEmail}</span>
						</p>
						<p className="mb-6 text-center text-xs text-gray-600">
							The link will expire in 15 minutes for security
							reasons.
						</p>

						<button
							className="h-10 w-full rounded bg-primary-500 font-semibold tracking-wide text-white transition-colors hover:bg-primary-400 active:bg-primary-600 disabled:opacity-70"
							onClick={handleResend}
							disabled={isDisabled || isLoading}
						>
							{isLoading ? (
								<SpinLoader className="mx-auto size-5" />
							) : isDisabled ? (
								`Resend in ${remainingTime}s`
							) : (
								'Resend Reset Email'
							)}
						</button>
					</>
				)}

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

export default ForgotPassword
