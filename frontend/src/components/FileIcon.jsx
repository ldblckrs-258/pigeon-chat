import { styleDefObj } from '@utils/fileIconStyle'
import { FileIcon as FileIconComponent, defaultStyles } from 'react-file-icon'
export default function FileIcon({ ext }) {
	const customDefaultLabelColor = styleDefObj[ext]
		? (styleDefObj[ext]['labelColor'] ?? '#4793af')
		: '#4793af'

	const libDefaultGlyphColor =
		defaultStyles[ext] && defaultStyles[ext]['labelColor']
	return (
		<FileIconComponent
			extension={ext}
			glyphColor={libDefaultGlyphColor ?? customDefaultLabelColor}
			labelColor={customDefaultLabelColor}
			{...defaultStyles[ext]}
			{...styleDefObj[ext]}
		/>
	)
}
