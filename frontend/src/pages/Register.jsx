import TextField from '@components/TextField'
import { useAuth } from '@hooks/useAuth'
import { useToast } from '@hooks/useToast'
import { useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { useNavigate } from 'react-router-dom'

const emptyData = {
	name: '',
	email: '',
	password: '',
	confirm: '',
}

const Register = () => {
	const { register } = useAuth()
	const [token, setToken] = useState(null)
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		confirm: '',
	})
	const [formError, setFormError] = useState(emptyData)
	const toast = useToast()
	const navigate = useNavigate()
	const validate = () => {
		let errors = { ...emptyData }
		let isValid = true

		if (formData.name === '') {
			errors.name = 'Name is required'
			isValid = false
		} else if (formData.name.length < 3) {
			errors.name = 'Name must be at least 3 characters'
			isValid = false
		}

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
		} else if (
			!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
				formData.password,
			)
		) {
			errors.password = 'Password is too weak'
			isValid = false
		}

		if (formData.confirm === '') {
			errors.confirm = 'Confirm password is required'
			isValid = false
		} else if (formData.confirm !== formData.password) {
			errors.confirm = 'Password does not match'
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
		// if (!token) {
		// 	toast.error('Register failed', 'Please complete the captcha', 3000)
		// 	return
		// }

		await register(formData.name, formData.email, formData.password)
	}

	return (
		<div className="relative flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-secondary-50 to-primary-100">
			<div className="z-10 mx-4 flex w-[420px] flex-col items-center rounded-lg border border-gray-300 bg-white px-6 py-8">
				<h1 className="mb-4 text-2xl font-semibold text-gray-800">
					Register
				</h1>
				<TextField
					className={'w-full'}
					label="Name"
					value={formData.name}
					maxLength={30}
					onChange={(e) => {
						setFormData({ ...formData, name: e.target.value })
						setFormError({ ...formError, name: '' })
					}}
					onEnter={handleSubmit}
					error={formError.name !== ''}
				/>
				<p className="mt-1 w-full text-left text-xs text-red-600">
					{formError.name}
				</p>
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
				<TextField
					className={'mt-4 w-full'}
					type="password"
					label="Confirm password"
					value={formData.confirm}
					onChange={(e) => {
						setFormData({ ...formData, confirm: e.target.value })
						setFormError({ ...formError, confirm: '' })
					}}
					onEnter={handleSubmit}
					error={formError.confirm !== ''}
				/>
				<p className="mt-1 w-full text-left text-xs text-red-600">
					{formError.confirm}
				</p>
				{/* <ReCAPTCHA
					className="my-4"
					sitekey={import.meta.env.VITE_CAPTCHA_SITEKEY}
					onChange={(val) => setToken(val)}
				/> */}
				<button
					className="mt-4 h-10 w-full rounded bg-secondary-300 font-semibold tracking-wide text-white transition-colors hover:bg-secondary-400 active:bg-secondary-500"
					onClick={handleSubmit}
				>
					Sign up
				</button>
				<div className="mt-4 text-sm">
					Already have an account?
					<button
						className="ml-1 text-sm text-primary-400 hover:underline"
						onClick={() => navigate('/')}
					>
						Login here
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

export default Register
