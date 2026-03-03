import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import './index.css'
import App from './App.tsx'
import 'antd/dist/reset.css'

// Alberta Government Theme Configuration
const albertaTheme = {
  token: {
    // Primary colors - Alberta Blue
    colorPrimary: '#003366',
    colorPrimaryHover: '#004d99',
    colorPrimaryActive: '#001f3d',
    
    // Success color - Alberta Green
    colorSuccess: '#006600',
    colorSuccessHover: '#008000',
    
    // Border radius
    borderRadius: 6,
    
    // Font
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    
    // Colors
    colorText: '#1f2937',
    colorTextSecondary: '#6b7280',
    colorBorder: '#e5e7eb',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
  },
  components: {
    Menu: {
      darkItemBg: '#003366',
      darkSubMenuItemBg: '#001f3d',
      darkItemSelectedBg: '#004d99',
      darkItemHoverBg: '#004d99',
    },
    Card: {
      borderRadius: 8,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    },
    Button: {
      borderRadius: 6,
      fontWeight: 500,
    },
    Input: {
      borderRadius: 6,
    },
    Table: {
      borderRadius: 8,
    },
  },
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider theme={albertaTheme}>
      <App />
    </ConfigProvider>
  </StrictMode>,
)
