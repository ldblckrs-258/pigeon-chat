import { useState, useEffect } from 'react'
/**
 * Hook to get the window size and check if the screen is wide
 * @returns {boolean} isWideScreen - Whether the screen width is greater than `1280px`
 * @returns {number} width - The width of the window
 * @returns {number} height - The height of the window
 */

function useWindowSize() {
	const [windowSize, setWindowSize] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
	})
	const [isWideScreen, setIsWideScreen] = useState(windowSize.width > 1280)

	useEffect(() => {
		const handleResize = () => {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			})
		}

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	useEffect(() => {
		setIsWideScreen(windowSize.width > 1280)
	}, [windowSize.width])

	return { ...windowSize, isWideScreen }
}

export default useWindowSize
