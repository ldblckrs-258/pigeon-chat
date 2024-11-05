export function trimFilename(fileName, length = 20) {
	var split = fileName.split('.')
	var ext = split.pop()
	var name = split.join('.')
	if (name.length > length - ext.length - 3) {
		name =
			name.substring(0, length - ext.length - 6) +
			'...' +
			name.substring(name.length - 3)
	}
	return name + '.' + ext
}

export function byteToMb(size) {
	return (size / 1000 / 1024).toFixed(2)
}
