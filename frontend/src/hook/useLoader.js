import { LoaderContext } from '../contexts/LoaderContext'
import { useContext } from 'react'

export const useLoader = () => {
	const { loading, setLoading } = useContext(LoaderContext)

	return { loading, setLoading }
}

export default useLoader
