export const useNotification = () => {
	const webTitle = 'Chat App'

	const titleNotify = (title) => {
		if (document.visibilityState === 'visible') return

		// switch between the two title every 1 second
		let switchTitle = true
		const interval = setInterval(() => {
			document.title = switchTitle ? title : webTitle
			switchTitle = !switchTitle
		}, 1000)

		// clear interval when the tab is active
		document.addEventListener('visibilitychange', () => {
			if (document.visibilityState === 'visible') {
				clearInterval(interval)
				document.title = webTitle
			}
		})

		// clear interval when the tab is focused
		window.addEventListener('focus', () => {
			clearInterval(interval)
			document.title = webTitle
		})

		// clear interval when the tab is closed
		window.addEventListener('beforeunload', () => {
			clearInterval(interval)
		})
	}

	const windowNotify = (title, body) => {
		const options = {
			body,
		}
		if (!('Notification' in window)) {
			alert('This browser does not support desktop notification')
		} else if (Notification.permission === 'granted') {
			new Notification(title, options)
		} else if (Notification.permission !== 'denied') {
			Notification.requestPermission().then((permission) => {
				if (permission === 'granted') {
					new Notification(title, options)
				}
			})
		}
	}

	return { titleNotify, windowNotify }
}
