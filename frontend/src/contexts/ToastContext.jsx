import { createContext, useReducer } from 'react'
import toastReducer from '../reducers/ToastReducer'
import ToastContainer from '../components/ToastContainer'
export const ToastContext = createContext()

const defaultState = {
	toasts: [],
}

export const ToastContextProvider = ({ children }) => {
	const [state, dispatch] = useReducer(toastReducer, defaultState)

	const addToast = (toast) => {
		const id = Math.floor(Math.random() * 10000)
		dispatch({ type: 'ADD_TOAST', payload: { ...toast, id } })
	}

	const remove = (id) => {
		dispatch({ type: 'REMOVE_TOAST', payload: { id } })
	}

	const success = (title, message, timeout) => {
		addToast({ title, message, timeout, type: 'success' })
	}

	const warning = (title, message, timeout) => {
		addToast({ title, message, timeout, type: 'warning' })
	}

	const error = (title, message, timeout) => {
		addToast({ title, message, timeout, type: 'error' })
	}

	const info = (title, message, timeout) => {
		addToast({ title, message, timeout, type: 'info' })
	}

	return (
		<ToastContext.Provider
			value={{ success, warning, error, info, remove }}
		>
			<ToastContainer toasts={state.toasts}>{children}</ToastContainer>
		</ToastContext.Provider>
	)
}
