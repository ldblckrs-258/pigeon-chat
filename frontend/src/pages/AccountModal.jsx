import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../hook/useAuth'
import { PiPenFill, PiXBold } from 'react-icons/pi'
import { useToast } from '../hook/useToast'
import TextField from '../components/TextField'
import axios from 'axios'

const AccountModal = ({ onClose }) => {
	const { user } = useAuth()
	const [hoverAvatar, setHoverAvatar] = useState(false)
	const inputImgRef = useRef(null)
	const toast = useToast()
	const [editData, setEditData] = useState(null)
	const { auth } = useAuth()
	const [isLoading, setIsLoading] = useState(false)
	const [tabIndex, setTabIndex] = useState(0)
	useEffect(() => {
		setEditData({
			name: user.name,
			avatar: user.avatar,
		})
	}, [user])
	const [pwdData, setPwdData] = useState({
		currentPwd: '',
		newPwd: '',
		confirmPwd: '',
	})

	const handleUploadImage = async (e) => {
		const file = e.target.files[0]
		if (!file) return
		const formData = new FormData()
		formData.append('image', file)
		setEditData({ ...editData, avatar: URL.createObjectURL(file) })
		setIsLoading(true)
		try {
			const res = await axios.post('/api/tools/upload/image', formData)
			setEditData({ ...editData, avatar: res.data.url })
		} catch (error) {
			console.error(error)
			setEditData({ ...editData, avatar: user.avatar })
			toast.error('Error', 'Upload image failed', 3000)
		}
		setIsLoading(false)
	}

	const handleSaveInfo = async () => {
		if (!editData.name) {
			return toast.error('Name is required', 'Enter your name', 3000)
		}
		if (editData.name === user.name && editData.avatar === user.avatar) {
			return onClose()
		}
		let wait = 0
		while (isLoading && wait < 15000) {
			await new Promise((resolve) => setTimeout(resolve, 100))
			wait += 100
		}
		if (isLoading) {
			return toast.error(
				'Upload image failed',
				'Please try again later',
				3000,
			)
		}
		try {
			await axios.put('/api/auth/update/info', editData)
			toast.success('Success', 'Update information successfully', 3000)
			auth()
			onClose()
		} catch (error) {
			console.error(error)
			toast.error(
				'Update information failed',
				'Please try again later',
				3000,
			)
		}
	}

	const validatePwd = () => {
		if (!pwdData.currentPwd || !pwdData.newPwd || !pwdData.confirmPwd) {
			return toast.error(
				'Password is required',
				'Enter your password',
				3000,
			)
		}
		if (pwdData.newPwd === pwdData.currentPwd) {
			return toast.error(
				'Password not change',
				'Enter a new password',
				3000,
			)
		}
		if (pwdData.newPwd !== pwdData.confirmPwd) {
			return toast.error(
				'Password not match',
				'Re-enter your password',
				3000,
			)
		}
		return true
	}

	const handleSavePwd = async () => {
		if (!validatePwd()) return
		try {
			await axios.put('/api/auth/update/password', {
				oldPassword: pwdData.currentPwd,
				newPassword: pwdData.newPwd,
			})
			toast.success('Success', 'Update password successfully', 3000)
			onClose()
		} catch (error) {
			if (error.response?.status === 400) {
				return toast.error(
					'Invalid password',
					error.response.data.message,
					3000,
				)
			} else {
				return toast.error(
					'Update password failed',
					'Please try again later',
					3000,
				)
			}
		}
	}

	return (
		<div className="fixed left-0 top-0 z-20 flex h-screen w-screen items-center justify-center bg-[#00000033]">
			<div className="mx-auto flex w-[440px] flex-col items-center overflow-hidden rounded-lg bg-white px-4 py-6">
				<div className="flex w-full items-center justify-between">
					<div className="flex items-center gap-1">
						<button
							className={`rounded px-3 py-1 font-semibold ${tabIndex === 0 ? 'bg-primary-100 text-primary-600' : 'text-primary-900 hover:bg-gray-100'}`}
							onClick={() => setTabIndex(0)}
						>
							Information
						</button>
						<button
							className={`rounded px-3 py-1 font-semibold ${tabIndex === 1 ? 'bg-primary-100 text-primary-600' : 'text-primary-900 hover:bg-gray-100'}`}
							onClick={() => setTabIndex(1)}
						>
							Security
						</button>
					</div>
					<button
						className="flex h-8 w-8 items-center justify-center rounded-full text-2xl text-gray-500 hover:text-secondary-500"
						onClick={onClose}
					>
						<PiXBold />
					</button>
				</div>
				{tabIndex === 0 ? (
					<div className="flex w-full flex-col items-center">
						<div
							className="relative mb-2 mt-6 h-20 w-20 overflow-hidden rounded-full border border-gray-400"
							onMouseEnter={() => setHoverAvatar(true)}
							onMouseLeave={() => setHoverAvatar(false)}
						>
							<img
								className="h-full w-full object-cover"
								src={editData?.avatar}
								alt="user-avatar"
							/>
							{hoverAvatar && (
								<div
									className="absolute left-0 top-0 flex h-full w-full cursor-pointer items-center justify-center bg-[#00000069] transition-all"
									onClick={() => inputImgRef.current.click()}
								>
									<PiPenFill className="text-2xl text-white" />
								</div>
							)}
							<input
								type="file"
								accept="image/*"
								className="hidden"
								ref={inputImgRef}
								onChange={handleUploadImage}
							/>
						</div>
						<TextField
							className="mt-4 w-full"
							label="Name"
							value={editData?.name}
							onChange={(e) =>
								setEditData({
									...editData,
									name: e.target.value,
								})
							}
							onEnter={handleSaveInfo}
						/>
						<TextField
							className="mt-4 w-full"
							label="Email"
							type="email"
							value={user.email}
							readOnly={true}
						/>
					</div>
				) : (
					<div className="flex w-full flex-col items-center gap-4 pt-6">
						<h3 className="text-lg font-semibold">
							Change password
						</h3>
						<TextField
							className="w-full"
							label="Current password"
							type="password"
							value={pwdData.currentPwd}
							onChange={(e) =>
								setPwdData({
									...pwdData,
									currentPwd: e.target.value,
								})
							}
							onEnter={() => {}}
						/>
						<TextField
							className="w-full"
							label="New password"
							type="password"
							value={pwdData.newPwd}
							onChange={(e) =>
								setPwdData({
									...pwdData,
									newPwd: e.target.value,
								})
							}
							onEnter={() => {}}
						/>
						<TextField
							className="w-full"
							label="Confirm password"
							type="password"
							value={pwdData.confirmPwd}
							onChange={(e) =>
								setPwdData({
									...pwdData,
									confirmPwd: e.target.value,
								})
							}
							onEnter={() => {}}
						/>
					</div>
				)}
				<button
					className="mt-6 rounded-lg bg-primary-400 px-8 py-1 font-semibold text-white transition-colors hover:bg-primary-500"
					onClick={() => {
						if (tabIndex === 0) {
							handleSaveInfo()
						} else {
							handleSavePwd()
						}
					}}
					disabled={isLoading}
				>
					{isLoading ? 'Uploading' : 'Save'}
				</button>
			</div>
		</div>
	)
}

export default AccountModal
