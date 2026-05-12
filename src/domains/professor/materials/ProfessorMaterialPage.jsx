import { useNavigate } from 'react-router-dom'
import AppLayout from '../../../components/layout/AppLayout/AppLayout.jsx'
import ProfessorMaterialContent from './ProfessorMaterialContent.jsx'

/**
 * 교수용 교안 파일 관리 (라우트: /professor/materials)
 */
export default function ProfessorMaterialPage() {
  const navigate = useNavigate()

  return (
    <AppLayout
      headerProps={{
        userEmail: 'professor@school.edu',
        onLogout: () => navigate('/professor'),
        logoHref: '/professor',
        logoLabel: 'EDU HUB',
        breadcrumbItems: [{ label: '교안 관리' }],
      }}
      contentClassName="edu-mat-app-layout-content"
    >
      <ProfessorMaterialContent />
    </AppLayout>
  )
}
