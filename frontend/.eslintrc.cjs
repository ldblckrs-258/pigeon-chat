module.exports = {
	root: true,
	env: { browser: true, es2020: true, node: true },
	extends: [
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:react/jsx-runtime',
		'plugin:react-hooks/recommended',
	],
	ignorePatterns: ['dist', '.eslintrc.cjs'],
	parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
	settings: { react: { version: '18.2' } },
	plugins: ['react-refresh', 'react', 'prettier'],
	rules: {
		'prettier/prettier': [
			'error',
			{
				endOfLine: 'auto',
				printWidth: 80,
				semi: false,
				useTabs: true,
				tabWidth: 4,
				singleQuote: true,
			},
		],
		'react/react-in-jsx-scope': 'off',
		'react/prop-types': 'off',
	},
}
