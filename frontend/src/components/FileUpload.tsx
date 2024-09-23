import React, { useState } from 'react'
import { io } from 'socket.io-client'

const socket = io('http://localhost:3000') // Kết nối tới server Socket.IO

const FileUpload = () => {
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [uploadMessage, setUploadMessage] = useState<string>('') // Trạng thái lưu trữ thông báo

	// Hàm xử lý khi chọn file
	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files.length > 0) {
			setSelectedFile(event.target.files[0])
			setUploadMessage('') // Xóa thông báo trước đó khi chọn file mới
		}
	}

	// Hàm gửi file qua Socket.IO
	const handleFileUpload = () => {
		if (selectedFile) {
			const reader = new FileReader()
			reader.onload = function (e) {
				const buffer = new Uint8Array(e.target?.result as ArrayBuffer)

				// Gửi file tới server qua sự kiện "file-upload"
				socket.emit('file-upload', {
					filename: selectedFile.name,
					data: buffer,
				})

				// Hiển thị thông báo đang tải file lên
				setUploadMessage('Uploading file...')
			}
			reader.readAsArrayBuffer(selectedFile) // Đọc file dưới dạng ArrayBuffer
		}
	}

	// Lắng nghe phản hồi từ server
	socket.on('file-upload-success', (data) => {
		setUploadMessage(`File uploaded successfully! URL: ${data.url}`) // Cập nhật thông báo thành công
	})

	socket.on('file-upload-error', (error) => {
		setUploadMessage('File upload failed. Please try again.') // Cập nhật thông báo lỗi
	})

	return (
		<div className="file-upload-container">
			<input type="file" onChange={handleFileChange} className="file-input" />
			<button
				onClick={handleFileUpload}
				className="upload-button mt-2 rounded bg-blue-500 p-2 text-white"
				disabled={!selectedFile}
			>
				Upload File
			</button>

			{/* Hiển thị thông báo */}
			{uploadMessage && (
				<div className="upload-message mt-4 p-2 text-center">
					{uploadMessage}
				</div>
			)}
		</div>
	)
}

export default FileUpload
