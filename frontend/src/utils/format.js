export function trimFilename(fileName, length = 20) {
	var split = fileName.split('.')
	var name = split[0]
	var ext = split[split.length - 1]
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
