import { LightboxContext } from '../contexts/LightboxContext'
import { useContext } from 'react'

export const useLightbox = () => {
	const { openLightbox, closeLightbox } = useContext(LightboxContext)

	return { openLightbox, closeLightbox }
}

export default useLightbox
