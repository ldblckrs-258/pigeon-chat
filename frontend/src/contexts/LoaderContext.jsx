import SpinLoader from '@components/SpinLoader'
import { createContext, useState } from 'react'

export const LoaderContext = createContext()

export const LoaderContextProvider = ({ children }) => {
	const [loading, setLoading] = useState(false)
	return (
		<LoaderContext.Provider value={{ loading, setLoading }}>
			{loading && (
				<div className="fixed z-50 flex h-screen w-screen items-center justify-end bg-gray-50">
					<SpinLoader className="m-auto h-28 w-28" />
				</div>
			)}
			{children}
		</LoaderContext.Provider>
	)
}
