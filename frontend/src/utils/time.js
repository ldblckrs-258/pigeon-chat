const timeAgo = (date) => {
	if (!date) return ''
	const currentDate = new Date()
	const previousDate = new Date(date)
	const diff = currentDate - previousDate
	const seconds = Math.floor(diff / 1000)
	const minutes = Math.floor(seconds / 60)
	const hours = Math.floor(minutes / 60)
	const days = Math.floor(hours / 24)
	const months = Math.floor(days / 30)
	const years = Math.floor(months / 12)

	if (years > 0) {
		return `${years} years`
	} else if (months > 0) {
		return `${months} months`
	} else if (days > 0) {
		return `${days} days`
	} else if (hours > 0) {
		return `${hours} hours`
	} else if (minutes > 0) {
		return `${minutes} minutes`
	} else if (seconds > 0) {
		return `${seconds} seconds`
	} else {
		return 'now'
	}
}

export { timeAgo }
