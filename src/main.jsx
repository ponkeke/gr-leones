import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'
import Preloader from './components/Preloader/Preloader.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Preloader />
    <App />
  </StrictMode>,
)
