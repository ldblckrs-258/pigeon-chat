// VoiceCallPage.jsx
import { useParams } from 'react-router-dom'
import VoiceCallModal from '../components/modal/VoiceCallModal'

const VoiceCallPage = () => {
	const { chatId } = useParams() // Lấy chatId từ URL

	return (
		<div>
			<VoiceCallModal isOpen={true} chatInfo={{ _id: chatId }} />
		</div>
	)
}

export default VoiceCallPage
