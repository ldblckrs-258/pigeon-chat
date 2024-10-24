// VoiceCallPage.jsx
import { useParams } from 'react-router-dom'
import VideoCallModal from '../components/modal/VideoCallModal'

const VideoCallPage = () => {
	const { chatId } = useParams() // Lấy chatId từ URL

	return (
		<div>
			<VideoCallModal isOpen={true} chatInfo={{ _id: chatId }} />
		</div>
	)
}

export default VideoCallPage
