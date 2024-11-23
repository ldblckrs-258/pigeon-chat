import { useState, useEffect } from 'react'
import { useAuth } from '../hook/useAuth'
import Checkbox from '../components/Checkbox'
import TextField from '../components/TextField'
import { useToast } from '../hook/useToast'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google'
import axios from 'axios'

const emptyData = {
	email: '',
	password: '',
}

const Login = () => {
	const { login, googleLogin } = useAuth()
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		isRemember: false,
	})
	const [formError, setFormError] = useState(emptyData)
	const toast = useToast()
	const navigate = useNavigate()
	const validate = () => {
		let errors = { ...emptyData }
		let isValid = true
		if (formData.email === '') {
			errors.email = 'Email is required'
			isValid = false
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			errors.email = 'Email is not valid'
			isValid = false
		}

		if (formData.password === '') {
			errors.password = 'Password is required'
			isValid = false
		}
		setFormError(errors)
		return isValid
	}

	const handleSubmit = async () => {
		const isValid = validate()
		if (!isValid) {
			toast.error('Register failed', 'Please check your form data', 3000)
			return
		}

		await login(formData.email, formData.password, formData.isRemember)
	}

	const handleGoogleLoginSuccess = async (response) => {
		await googleLogin(response?.credential, formData.isRemember)
	}

	const handleGoogleLoginError = (error) => {
		toast.error('Google login failed', error?.message, 5000)
	}

	return (
		<div className="relative flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-secondary-50 to-primary-100">
			<div className="z-10 mx-4 flex w-[420px] flex-col items-center rounded-lg border border-gray-300 bg-white px-6 py-8">
				<h1 className="mb-4 text-2xl font-semibold text-gray-800">
					Welcome
				</h1>
				<TextField
					className={'mt-4 w-full'}
					label="Email"
					type="email"
					value={formData.email}
					maxLength={50}
					onChange={(e) => {
						setFormData({ ...formData, email: e.target.value })
						setFormError({ ...formError, email: '' })
					}}
					onEnter={handleSubmit}
					error={formError.email !== ''}
				/>
				<p className="mt-1 w-full text-left text-xs text-red-600">
					{formError.email}
				</p>
				<TextField
					className={'mt-4 w-full'}
					type="password"
					label="Password"
					value={formData.password}
					maxLength={20}
					onChange={(e) => {
						setFormData({ ...formData, password: e.target.value })
						setFormError({ ...formError, password: '' })
					}}
					onEnter={handleSubmit}
					error={formError.password !== ''}
				/>
				<p className="mt-1 w-full text-left text-xs text-red-600">
					{formError.password}
				</p>
				<div className="my-4 flex w-full items-center justify-between">
					<div className="flex items-center gap-2 pl-1">
						<Checkbox
							className=""
							label="Remember me"
							checked={formData.isRemember}
							onChange={(e) => {
								setFormData({
									...formData,
									isRemember: e.target.checked,
								})
							}}
						/>
					</div>
					<button
						onClick={() => {
							toast.info(
								'Forgot password?',
								'Please contact your administrator',
								3000,
							)
						}}
						className="text-sm text-primary-400 hover:underline"
					>
						Forgot password?
					</button>
				</div>

				<button
					className="h-10 w-full rounded bg-primary-300 font-semibold tracking-wide text-white transition-colors hover:bg-primary-400 active:bg-primary-500"
					onClick={handleSubmit}
				>
					Login
				</button>
				<div className="mt-3 w-full">
					<div className="mx-auto">
						<GoogleLogin
							onSuccess={handleGoogleLoginSuccess}
							onError={handleGoogleLoginError}
							use_fedcm_for_prompt={false}
						/>
					</div>
				</div>

				<div className="mt-4 text-sm">
					Don&apos;t have account?
					<button
						className="ml-1 text-sm text-secondary-500 hover:underline"
						onClick={() => navigate('/register')}
					>
						Register here.
					</button>
				</div>
			</div>
			<div>
				<section className="absolute left-8 top-12 rounded-full bg-secondary-100 blur-[80px] lg:h-[280px] lg:w-[440px]"></section>
				<section className="absolute bottom-4 right-8 rounded-full bg-primary-100 blur-[80px] lg:h-[320px] lg:w-[520px]"></section>
			</div>
		</div>
	)
}

export default Login
