import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const network = {
	CLIENT_PORT: process.env.VITE_CLIENT_PORT || 3001,
	SERVER_PORT: process.env.VITE_SERVER_PORT || 3000,
	SERVER_URL: process.env.VITE_SERVER_URL || 'http://localhost',
}

export default defineConfig({
	plugins: [react()],
	server: {
		port: network.CLIENT_PORT,
		proxy: {
			'/api': {
				target: `${network.SERVER_URL}:${network.SERVER_PORT}`,
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ''),
			},
		},
	},
})
