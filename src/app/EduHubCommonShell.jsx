import { useState } from 'react'
import './EduHubCommonShell.css'
import { API_BASE_URL } from '@/config/env'
import { AppLayout } from '../components/layout/index.js'
import { Button, ConfirmModal, MenuCard, SelectDropdown } from '../components/ui/index.js'
import { PdfViewerSection } from '../components/media/index.js'

/**
 * EDU HUB 공통 컴포넌트 뼈대 검증용 화면.
 * 교수/학생 도메인 페이지는 여기에 포함하지 않습니다.
 */
export default function EduHubCommonShell() {
  const [modalOpen, setModalOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selected, setSelected] = useState(null)

  const options = [
    { value: 'a', label: '옵션 A' },
    { value: 'b', label: '옵션 B' },
  ]

  return (
    <AppLayout
      headerProps={{
        userEmail: 'user@school.edu',
        onLogout: () => {},
        logoHref: '/',
        logoLabel: 'EDU HUB',
        logoImageOnly: true,
      }}
      contentClassName="edu-common-shell__layout-content"
    >
      <div className="edu-common-shell">
        <header className="edu-common-shell__intro">
          <h1 className="edu-common-shell__title">공통 UI 뼈대</h1>
          <p className="edu-common-shell__desc">
            AppLayout · Header · Button · MenuCard · SelectDropdown · ConfirmModal · PdfViewerSection
          </p>
          <p className="edu-common-shell__env-hint" aria-label="Configured API base URL">
            VITE_API_BASE_URL: {API_BASE_URL || '(empty)'}
          </p>
        </header>

        <section className="edu-common-shell__section" aria-labelledby="section-menucard">
          <h2 id="section-menucard" className="edu-common-shell__section-title">
            MenuCard
          </h2>
          <div className="edu-common-shell__grid edu-common-shell__grid--cards">
            <MenuCard icon="📋" title="샘플 메뉴" onClick={() => {}} />
          </div>
        </section>

        <section className="edu-common-shell__section" aria-labelledby="section-dropdown">
          <h2 id="section-dropdown" className="edu-common-shell__section-title">
            SelectDropdown
          </h2>
          <div className="edu-common-shell__narrow">
            <SelectDropdown
              options={options}
              selected={selected}
              placeholder="항목을 선택하세요"
              isOpen={dropdownOpen}
              onOpenChange={setDropdownOpen}
              onSelect={setSelected}
            />
          </div>
        </section>

        <section className="edu-common-shell__section" aria-labelledby="section-pdf">
          <h2 id="section-pdf" className="edu-common-shell__section-title">
            PdfViewerSection
          </h2>
          <PdfViewerSection />
        </section>

        <section className="edu-common-shell__section" aria-labelledby="section-buttons">
          <h2 id="section-buttons" className="edu-common-shell__section-title">
            Button · ConfirmModal
          </h2>
          <div className="edu-common-shell__row">
            <Button type="button" variant="primary" onClick={() => setModalOpen(true)}>
              확인 모달 열기
            </Button>
            <Button type="button" variant="secondary" onClick={() => {}}>
              보조 버튼
            </Button>
          </div>
        </section>

        <ConfirmModal
          isOpen={modalOpen}
          message="저장하시겠습니까?"
          onConfirm={() => setModalOpen(false)}
          onCancel={() => setModalOpen(false)}
        />
      </div>
    </AppLayout>
  )
}
