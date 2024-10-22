const VoiceCallModal = ({ isOpen, onClose, chatInfo }) => {
	if (!isOpen) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
			<div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
				<h2 className="mb-4 text-lg font-semibold">
					Voice Call with {chatInfo.name}
				</h2>
				<div className="flex items-center justify-center">
					<img
						className="h-24 w-24 rounded-full border object-cover"
						src={chatInfo.avatar}
						alt="targetUser-avatar"
					/>
				</div>
				<div className="mt-6 flex justify-between">
					<button
						onClick={onClose}
						className="rounded-lg bg-red-500 px-4 py-2 text-white"
					>
						End Call
					</button>
				</div>
			</div>
		</div>
	)
}

export default VoiceCallModal
