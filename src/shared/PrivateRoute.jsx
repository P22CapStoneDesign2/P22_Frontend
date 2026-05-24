/*private route 필요할 때 추가하면 됨*/
/*로그인 한 사람만 들어갈 수 있는 화면*/

import { Navigate } from 'react-router-dom'
import { ROUTES } from './constants/routes.js'
import { getAccessToken } from './auth/tokenStorage.js'

export default function PrivateRoute({ children }) {
  if (!getAccessToken()) {
    return <Navigate to={ROUTES.home} replace />
  }

  return children
}