const styleDef = []

// video ////////////////////////////////////
const videoStyle = {
	labelColor: '#FF3E4C',
}
const videoExtList = [
	'avi',
	'3g2',
	'3gp',
	'aep',
	'asf',
	'flv',
	'm4v',
	'mkv',
	'mov',
	'mp4',
	'mpeg',
	'mpg',
	'ogv',
	'pr',
	'swfw',
	'webm',
	'wmv',
	'swf',
	'rm',
]

styleDef.push([videoStyle, videoExtList])

// image ////////////////////////////////////
const imageStyle = {
	labelColor: '#005FAD',
}

const imageExtList = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'tif', 'tiff']

styleDef.push([imageStyle, imageExtList])

// zip ////////////////////////////////////
const zipStyle = {
	labelColor: '#f7e700',
	labelTextColor: '#000',
	glyphColor: '#de9400',
}

const zipExtList = ['zip', 'zipx', '7zip', 'tar', 'sitx', 'gz', 'rar']

styleDef.push([zipStyle, zipExtList])

// audio ////////////////////////////////////
const audioStyle = {
	labelColor: '#b213d6',
}

const audioExtList = [
	'aac',
	'aif',
	'aiff',
	'flac',
	'm4a',
	'mid',
	'mp3',
	'ogg',
	'wav',
]

styleDef.push([audioStyle, audioExtList])

// text ////////////////////////////////////
const textStyle = {
	labelColor: '#143c99',
}

const textExtList = [
	'cue',
	'odt',
	'md',
	'rtf',
	'txt',
	'tex',
	'wpd',
	'wps',
	'xlr',
	'fodt',
]

styleDef.push([textStyle, textExtList])

// system ////////////////////////////////////
const systemStyle = {
	labelColor: '#111',
}

const systemExtList = ['exe', 'ini', 'dll', 'plist', 'sys']

styleDef.push([systemStyle, systemExtList])

// srcCode ////////////////////////////////////
const srcCodeStyle = {
	glyphColor: '#0072FF',
	labelColor: '#0072FF',
}

const srcCodeExtList = [
	'asp',
	'aspx',
	'c',
	'cpp',
	'cs',
	'css',
	'scss',
	'py',
	'json',
	'htm',
	'html',
	'java',
	'yml',
	'php',
	'js',
	'ts',
	'rb',
	'jsx',
	'tsx',
]

styleDef.push([srcCodeStyle, srcCodeExtList])

// vector ////////////////////////////////////
const vectorStyle = {
	labelColor: '#ff8000',
}

const vectorExtList = ['dwg', 'dxf', 'ps', 'svg', 'eps']

styleDef.push([vectorStyle, vectorExtList])

// font ////////////////////////////////////
const fontStyle = {
	labelColor: '#555',
}

const fontExtList = ['fnt', 'ttf', 'otf', 'fon', 'eot', 'woff']

styleDef.push([fontStyle, fontExtList])

// objectModel ////////////////////////////////////
const objectModelStyle = {
	labelColor: '#bf6a02',
	glyphColor: '#bf6a02',
}

const objectModelExtList = ['3dm', '3ds', 'max', 'obj', 'pkg']

styleDef.push([objectModelStyle, objectModelExtList])

// sheet ////////////////////////////////////
const sheetStyle = {
	labelColor: '#2a6e00',
}

const sheetExtList = ['csv', 'fods', 'ods', 'xlr']

styleDef.push([sheetStyle, sheetExtList])

//////////////////////////////////////////////////

// Style by extension /////////////////////////////////

const defaultStyle = {
	pdf: {
		glyphColor: 'white',
		color: '#D93831',
	},
}

function createStyleObj(extList, styleObj) {
	return Object.fromEntries(
		extList.map((ext) => {
			return [ext, styleObj]
		}),
	)
}

export const styleDefObj = styleDef.reduce((acc, [fileStyle, fileExtList]) => {
	return { ...acc, ...createStyleObj(fileExtList, fileStyle) }
}, defaultStyle)
