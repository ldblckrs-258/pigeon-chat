import React, { useState, useEffect } from 'react'
import io from 'socket.io-client'
import axios from 'axios'

const socket = io('http://localhost:3000') // Kết nối với Socket.io server

const FileReceiver = () => {
	const [fileRequest, setFileRequest] = useState(null)
	const [downloadProgress, setDownloadProgress] = useState(0)

	useEffect(() => {
		// Lắng nghe sự kiện fileUploadRequest từ server
		socket.on('fileUploadRequest', (data) => {
			setFileRequest(data) // Nhận thông tin về file
		})

		return () => {
			socket.off('fileUploadRequest')
		}
	}, [])

	const handleAccept = () => {
		axios({
			url: `/api/download/${fileRequest.fileName}`,
			method: 'GET',
			responseType: 'blob',
			onDownloadProgress: (progressEvent) => {
				const percentCompleted = Math.round(
					(progressEvent.loaded * 100) / progressEvent.total,
				)
				setDownloadProgress(percentCompleted)
			},
		})
			.then((response) => {
				// Tạo link tải file xuống
				const url = window.URL.createObjectURL(
					new Blob([response.data]),
				)
				const link = document.createElement('a')
				link.href = url
				link.setAttribute('download', fileRequest.fileName)
				document.body.appendChild(link)
				link.click()
			})
			.catch((error) => {
				console.error('Download failed', error)
			})
	}

	return (
		<>
			{fileRequest && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
						<h2 className="mb-4 text-xl font-semibold">
							File from {fileRequest.senderName}
						</h2>
						<p className="mb-2">
							File name: {fileRequest.fileName}
						</p>
						<p className="mb-4">Size: {fileRequest.fileSize} KB</p>
						<button
							className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
							onClick={handleAccept}
						>
							Accept and Download
						</button>
						<progress
							className="mt-4 w-full"
							value={downloadProgress}
							max="100"
						>
							{downloadProgress}%
						</progress>
					</div>
				</div>
			)}
		</>
	)
}

export default FileReceiver
