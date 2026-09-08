import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRouter from './AppRouter.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

// Fallback dummy ID to prevent GoogleOAuthProvider from throwing if VITE_GOOGLE_CLIENT_ID is empty
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '000000000000-placeholder.apps.googleusercontent.com';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <AppRouter />
    </GoogleOAuthProvider>
  </StrictMode>,
)


