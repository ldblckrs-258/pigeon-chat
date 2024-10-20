const VideoCallModal = ({ isOpen, onClose, chatInfo }) => {
	if (!isOpen) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
			<div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
				<h2 className="mb-4 text-lg font-semibold text-gray-800">
					Video Call with {chatInfo.name}
				</h2>
				<div className="flex items-center justify-center">
					<video
						className="h-72 w-full rounded-lg border-2 border-gray-300 bg-black"
						controls
					>
						{/* Video feed placeholder */}
					</video>
				</div>
				<div className="mt-6 flex justify-center">
					<button
						onClick={onClose}
						className="rounded-lg bg-red-500 px-6 py-3 text-white shadow-md transition-all duration-300 ease-in-out hover:bg-red-600"
					>
						End Call
					</button>
				</div>
			</div>
		</div>
	)
}
export default VideoCallModal
