import SpinLoader from '@components/SpinLoader'
import { useAuth } from '@hooks/useAuth'
import { useToast } from '@hooks/useToast'
import axios from 'axios'
import { useState } from 'react'

const ResendVerifyPage = () => {
	const { user, logout } = useAuth()
	const [isDisabled, setIsDisabled] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [remainingTime, setRemainingTime] = useState(30)
	const toast = useToast()
	const email = user?.email.replace(/(?<=.{3}).(?=[^@]*?.@)/g, '*')

	const handleResend = async () => {
		setIsLoading(true)
		try {
			await axios.get('api/auth/resend-v-email')
			setIsDisabled(true)
			toast.success(
				'Successful',
				'Verification email sent successfully',
				5000,
			)
			setRemainingTime(30)
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
			toast.error(err.response.data.message)
		}
		setIsLoading(false)
	}

	return (
		<div className="relative flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-secondary-50 to-primary-100">
			<div className="z-10 mx-4 flex w-[420px] flex-col items-center rounded-lg border border-gray-300 bg-white px-6 py-8">
				<h2 className="mb-4 text-xl font-semibold text-gray-800">
					Your account is not verified
				</h2>
				<p className="mb-4 text-center text-sm text-gray-700">
					Please check your email{' '}
					<span className="font-semibold">{email}</span> to verify
					your account
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
						'Resend verification email'
					)}
				</button>
				<button
					className="mt-3 flex h-10 w-full items-center justify-center gap-1 rounded border border-gray-300 text-sm font-semibold tracking-wide text-gray-700 transition-all hover:ring-1"
					onClick={logout}
				>
					Sign out
				</button>
			</div>
			<div>
				<section className="absolute left-8 top-12 rounded-full bg-secondary-100 blur-[80px] lg:h-[280px] lg:w-[440px]"></section>
				<section className="absolute bottom-4 right-8 rounded-full bg-primary-100 blur-[80px] lg:h-[320px] lg:w-[520px]"></section>
			</div>
		</div>
	)
}

export default ResendVerifyPage
