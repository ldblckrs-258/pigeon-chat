// VoiceCallPage.jsx
import VideoCallModal from '@components/modal/VideoCallModal'
import { useParams } from 'react-router-dom'

const VideoCallPage = () => {
	const { chatId } = useParams() // Lấy chatId từ URL

	return (
		<div>
			<VideoCallModal isOpen={true} chatInfo={{ _id: chatId }} />
		</div>
	)
}

export default VideoCallPage
