/**
 * 추후 학생 화면 등에서 `headerProps.breadcrumbItems` 참고용 예시
 * @typedef {{ label: string, to?: string }} BreadcrumbItem
 */

import { ROUTES } from '../../shared/constants/routes.js'

/** @type {BreadcrumbItem[]} */
export const STUDENT_BREADCRUMB_EXAMPLE = [
  { label: '교안 보기', to: ROUTES.studentMaterials },
  { label: '퀴즈 풀기', to: ROUTES.studentQuizMaterials },
]
