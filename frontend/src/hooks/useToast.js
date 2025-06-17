import { ToastContext } from '@contexts/ToastContext'
import { useContext } from 'react'

export const useToast = () => {
	const context = useContext(ToastContext)
	return context
}
