import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import AppLayout from './AppLayout.jsx'
import LoginPage from './LoginPage.jsx'
import SignUpPage from './SignUpPage.jsx'
import KakaoCallbackPage from './KakaoCallbackPage.jsx'
import KakaoSignUpPage from './KakaoSignUpPage.jsx'
import { ROUTES } from './shared/constants/routes.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.home} element={<LoginPage />} />
        <Route path={ROUTES.signup} element={<SignUpPage />} />
        <Route path={ROUTES.kakaoCallback} element={<KakaoCallbackPage />} />
        <Route path={ROUTES.kakaoSignup} element={<KakaoSignUpPage />} />
        <Route path={ROUTES.workspace} element={<AppLayout />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
