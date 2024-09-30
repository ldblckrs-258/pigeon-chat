import {
	PiCheckCircleFill,
	PiInfoFill,
	PiWarningCircleFill,
	PiXBold,
	PiXCircleFill,
} from 'react-icons/pi'
import { motion } from 'framer-motion'
import { useToast } from '../hook/useToast'
import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'

const ToastTypes = {
	success: {
		icon: <PiCheckCircleFill />,
		color: '#2a9d8f',
	},
	warning: {
		icon: <PiWarningCircleFill />,
		color: '#e9c46a',
	},
	error: {
		icon: <PiXCircleFill />,
		color: '#E75A51',
	},
	info: {
		icon: <PiInfoFill />,
		color: '#2898C8',
	},
}

const Toast = ({ id, title, message, type, timeout }) => {
	const { icon, color } = ToastTypes[type]
	const toast = useToast()

	useEffect(() => {
		const timer = setTimeout(() => {
			toast.remove(id)
		}, timeout)
		return () => clearTimeout(timer)
	}, [id])

	return (
		<motion.div
			id={'toast-' + id}
			layoutId={'toast-' + id}
			initial={{ opacity: 0, x: '110%' }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: '110%' }}
			className="w-[380px] rounded-lg border-l-[6px] bg-gray-100 py-2 pr-1 shadow-lg"
			style={{ borderColor: color }}
		>
			<div className="ml-3 flex items-center gap-3">
				<div className="text-2xl" style={{ color: color }}>
					{icon}
				</div>
				<div className="flex-1">
					<h4 className="line-clamp-1 text-base font-semibold">
						{title}
					</h4>
					<p className="text-sm">{message}</p>
				</div>
				<div className="relative">
					<CountdownCircleTimer
						isPlaying
						duration={(timeout - 0.2) / 1000}
						colors={[color, '#ccc']}
						size={28}
						strokeWidth={3}
					></CountdownCircleTimer>
					<button
						className="hover:text-tertiary-1 absolute left-0 top-0 rounded-full p-1.5 hover:text-red-600"
						onClick={() => toast.remove(id)}
					>
						<PiXBold />
					</button>
				</div>
			</div>
		</motion.div>
	)
}

Toast.propTypes = {
	id: PropTypes.number.isRequired,
	title: PropTypes.string.isRequired,
	message: PropTypes.string.isRequired,
	type: PropTypes.oneOf(['success', 'warning', 'error', 'info']),
	timeout: PropTypes.number,
}

export default Toast
