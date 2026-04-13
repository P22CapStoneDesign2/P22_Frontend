import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// 교안(LessonScript) 화면 띄우고 싶을 때
import LessonScript from './LessonScript.jsx'

//퀴즈 화면 띄우고 싶을 때
// import App from './App.jsx' 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 교안(LessonScript) 화면 띄우고 싶을 때 */}
    <LessonScript />
    
    {/* 퀴즈 화면 띄우고 싶을 때 */}
    {/* <App /> */}
  </StrictMode>,
)
