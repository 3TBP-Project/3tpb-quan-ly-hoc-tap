import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import './styles/theme.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthProvider'
import { applyTheme, getSavedTheme } from './utils/theme'

// Áp chế độ sáng/tối đã lưu trước khi vẽ giao diện để không bị nháy màu
applyTheme(getSavedTheme())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
