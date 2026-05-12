import './ExplanationBox.css'

export default function ExplanationBox({ explanation }) {
  return (
    <section className="edu-quiz-result-expl" aria-label="해설">
      <h3 className="edu-quiz-result-expl__title">해설</h3>
      <p className="edu-quiz-result-expl__text">{explanation || '해설이 없습니다.'}</p>
    </section>
  )
}
