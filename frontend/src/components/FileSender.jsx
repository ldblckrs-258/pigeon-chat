import { useState } from 'react'

const FileSender = ({ id }) => {
	const [file, setFile] = useState(null)
	const [progress, setProgress] = useState(0) // Trạng thái cho tiến trình truyền file

	const handleSendFile = () => {
		if (!file) return

		const fileReader = new FileReader()
		const chunkSize = 16384 // Kích thước mỗi chunk
		let offset = 0

		fileReader.onload = (e) => {
			// Tính toán tiến trình truyền
			const currentProgress = Math.min((offset / file.size) * 100, 100)
			setProgress(currentProgress)

			// Cập nhật nếu file chưa truyền xong
			if (offset < file.size) {
				offset += chunkSize
				sendChunk(file.slice(offset, offset + chunkSize))
			} else {
				console.log('File transmission complete')
			}
		}

		const sendChunk = (chunk) => {
			// Gửi chunk qua WebRTC hoặc socket (giả sử `dataChannel` đã được thiết lập)
			dataChannel.send(chunk)
		}

		// Đọc và gửi chunk đầu tiên
		fileReader.readAsArrayBuffer(file.slice(0, chunkSize))
	}

	return (
		<div className="flex flex-col items-center justify-center gap-2">
			<input type="file" onChange={(e) => setFile(e.target.files[0])} />
			<button
				onClick={handleSendFile}
				className="rounded bg-blue-500 px-4 py-2 text-white"
			>
				Send file
			</button>
			{/* Hiển thị tiến trình truyền file */}
			<progress className="w-full" value={progress} max="100">
				{progress}%
			</progress>
		</div>
	)
}

export default FileSender
