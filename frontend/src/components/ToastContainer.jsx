import Toast from './Toast'
import { AnimatePresence } from 'framer-motion'
import PropTypes from 'prop-types'

const ToastContainer = ({ toasts, children }) => {
	return (
		<>
			{children}
			<div className="fixed right-4 top-4 z-50 flex flex-col gap-3">
				<AnimatePresence>
					{toasts.map((toast) => (
						<Toast key={toast.id} {...toast} />
					))}
				</AnimatePresence>
			</div>
		</>
	)
}

ToastContainer.propTypes = {
	toasts: PropTypes.array.isRequired,
	children: PropTypes.node,
}

export default ToastContainer
