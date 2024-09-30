const toastReducer = (state, action) => {
	switch (action.type) {
		case 'ADD_TOAST':
			return {
				...state,
				toasts: [...state.toasts, action.payload],
			}
		case 'REMOVE_TOAST': {
			const updatedToasts = state.toasts.filter(
				(toast) => toast.id !== action.payload.id,
			)
			return {
				...state,
				toasts: updatedToasts,
			}
		}
		default:
			throw new Error(`Unsupported action type ${action.type}`)
	}
}

export default toastReducer
