import { StatusBadge } from "./StatusBadge.jsx";

export function AnswerPreviewCard({ item, editable = false, onChange = null }) {
  return (
    <article className="answer-card">
      <div className="question-card-header">
        <div>
          <strong>{item.order}. {item.questionText}</strong>
        </div>
        <div className="topbar-chip-group">
          <StatusBadge tone="success">{item.inferredQuestionType}</StatusBadge>
          {item.figureRequired ? <StatusBadge tone="warning">mini-figure</StatusBadge> : null}
        </div>
      </div>
      {editable ? (
        <textarea
          className="input textarea"
          onChange={(event) => onChange?.(item, event.target.value)}
          value={item.answerText}
        />
      ) : (
        <p className="answer-text">{item.answerText}</p>
      )}
      {item.figureRequired ? (
        <div className="figure-plan-card">
          <strong>{item.figureType || "Mini-figure planned"}</strong>
          <p className="support-copy">{item.figureInstructions}</p>
        </div>
      ) : null}
    </article>
  );
}
