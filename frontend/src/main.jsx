import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import './index.css'
import { AuthContextProvider } from './contexts/AuthContext.jsx'
import { ToastContextProvider } from './contexts/ToastContext.jsx'
import { LoaderContextProvider } from './contexts/LoaderContext.jsx'
import { SocketContextProvider } from './contexts/SocketContext.jsx'
import { ChatContextProvider } from './contexts/ChatContext.jsx'
import { LightboxContextProvider } from './contexts/LightboxContext.jsx'
import { FileReceiveContextProvider } from './contexts/FileReceiveContext.jsx'
import Compose from './contexts/Compose.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
	<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
		<BrowserRouter>
			<Compose
				components={[
					AuthContextProvider,
					ToastContextProvider,
					LoaderContextProvider,
					SocketContextProvider,
					ChatContextProvider,
					LightboxContextProvider,
					FileReceiveContextProvider,
				]}
			>
				<App />
			</Compose>
		</BrowserRouter>
	</GoogleOAuthProvider>,
)
