import { Link } from 'react-router-dom'
import { studentMaterialViewerPath } from '../../../shared/constants/routes.js'
import './StudentMaterialsPage.css'

const MOCK_MATERIAL_LINKS = [
  { id: 1, title: '샘플 교안 1' },
  { id: 2, title: '샘플 교안 2' },
]

export default function StudentMaterialsPage() {
  return (
    <div className="edu-stu-mat-list">
      <h1 className="edu-stu-mat-list__title">교안 보기</h1>
      <p className="edu-stu-mat-list__intro">
        (정세영)pdf뷰어를 버튼에 연결하느라 임시로 만들어둔 화면입니다. 구현 다시 하시면 됩니다
      </p>
      <ul className="edu-stu-mat-list__items">
        {MOCK_MATERIAL_LINKS.map((item) => (
          <li key={item.id} className="edu-stu-mat-list__item">
            <Link className="edu-stu-mat-list__link" to={studentMaterialViewerPath(item.id)}>
              <span className="edu-stu-mat-list__link-title">{item.title}</span>
              <span className="edu-stu-mat-list__link-meta">교안 ID {item.id}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
