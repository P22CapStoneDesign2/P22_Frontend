import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
//PROFESSOR 화면 띄우고 싶을 때
import Professor from './Professor.jsx'

//퀴즈 화면 띄우고 싶을 때
// import App from './App.jsx' 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* PROFESSOR 화면 띄우고 싶을 때 */}
    <Professor />
    
    {/* 퀴즈 화면 띄우고 싶을 때 */}
    {/* <App /> */}
  </StrictMode>,
)
