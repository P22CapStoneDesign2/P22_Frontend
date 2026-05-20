import { getStoredUserRole, isStudentRole } from './roleUtils.js'

/**
 * 학생 계정의 퀴즈 변경 API 호출 차단
 * @returns {Promise<never> | null} 거부 시 rejected Promise, 허용 시 null
 */
export function rejectQuizMutationIfStudent() {
  if (!isStudentRole(getStoredUserRole())) return null
  return Promise.reject(
    Object.assign(new Error('학생 계정에서는 퀴즈를 수정할 수 없습니다.'), {
      code: 'QUIZ_MUTATION_FORBIDDEN',
    }),
  )
}
