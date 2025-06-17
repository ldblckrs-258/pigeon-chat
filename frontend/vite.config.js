import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'

export default ({ mode }) => {
	process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }

	return defineConfig({
		plugins: [react()],
		resolve: {
			alias: {
				'@': path.resolve(__dirname, './src'),
				'@components': path.resolve(__dirname, './src/components'),
				'@pages': path.resolve(__dirname, './src/pages'),
				'@hooks': path.resolve(__dirname, './src/hooks'),
				'@utils': path.resolve(__dirname, './src/utils'),
				'@contexts': path.resolve(__dirname, './src/contexts'),
				'@reducers': path.resolve(__dirname, './src/reducers'),
			},
		},
		server: {
			port: process.env.VITE_CLIENT_PORT,
			proxy: {
				'/api': {
					target: `${process.env.VITE_SERVER_URI}`,
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api/, ''),
				},
			},
		},
	})
}
