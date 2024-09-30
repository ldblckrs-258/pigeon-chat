const isOnline = (members, userId, onlineUsers) => {
	if (!members || members.length === 0) return false
	if (typeof members === 'string') {
		if (members === userId) return true
		return onlineUsers?.some((onlineUser) => onlineUser === members)
	}

	return members.some((member) => {
		if (member._id === userId) return false
		return onlineUsers?.some((onlineUser) => onlineUser === member._id)
	})
}

export { isOnline }
