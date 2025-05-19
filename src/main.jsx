import React from 'react'
import ReactDOM from 'react-dom/client'
import AppRouter from './AppRouter'  // ← 旧 Main.jsx をリネームしたもの
import './index.css'                 // なければこの行は削除OK

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
)
