/*private route 필요할 때 추가하면 됨*/
/*로그인 한 사람만 들어갈 수 있는 화면*/

import { Navigate } from 'react-router-dom'
import { ROUTES } from './constants/routes.js'

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem('accessToken')

  if (!token) {
    return <Navigate to={ROUTES.login} replace />
  }

  return children
}