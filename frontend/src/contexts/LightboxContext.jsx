import Lightbox from '@components/Lightbox'
import { AnimatePresence } from 'framer-motion'
import { createContext, useState } from 'react'

export const LightboxContext = createContext()

export const LightboxContextProvider = ({ children }) => {
	const [lightbox, setLightbox] = useState(null)
	const openLightbox = (url) => {
		setLightbox(url)
	}
	const closeLightbox = () => {
		setLightbox(null)
	}
	return (
		<LightboxContext.Provider value={{ openLightbox, closeLightbox }}>
			<AnimatePresence>
				{lightbox && (
					<Lightbox url={lightbox} onClose={closeLightbox} />
				)}
			</AnimatePresence>
			{children}
		</LightboxContext.Provider>
	)
}
