import { PiXBold } from 'react-icons/pi'
import { twMerge } from 'tailwind-merge'
import { motion } from 'framer-motion'

const Lightbox = ({ url, onClose, className }) => {
	return (
		<motion.div
			className={twMerge(
				'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80',
				className,
			)}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.1, ease: 'easeInOut' }}
		>
			<div className="relative h-[90%] w-[90%]">
				<button
					className="absolute right-0 top-0 p-2 text-2xl text-white transition-colors hover:text-secondary-400"
					onClick={onClose}
				>
					<PiXBold />
				</button>
				<img
					src={url}
					alt="lightbox"
					className="h-full w-full object-contain"
				/>
			</div>
		</motion.div>
	)
}

export default Lightbox
