import type { QuizQuestion as QuestionDefinition } from '../../../tasks/quiz-types';
import { Markdown } from '../../components/Markdown';
import type { QuizContent } from './content';

export function QuizQuestion({
  question, content, path, answer, explanation, checkedAnswer, onAnswer, onExplanation,
}: {
  question: QuestionDefinition; content: QuizContent; path: string;
  answer: string; explanation: string; checkedAnswer?: string;
  onAnswer: (value: string) => void; onExplanation: (value: string) => void;
}) {
  const answerOption = question.options.find(option => option.id === question.answerId);
  return <section className="card quiz-question" aria-labelledby={`${question.id}-heading`} data-question-id={question.id}>
    <h2 id={`${question.id}-heading`}>{content.title}</h2>
    <Markdown text={content.statement} path={path} />
    <fieldset>
      <legend>Ответ для сниппета {question.id.replace('snippet-', '')}</legend>
      <div className="quiz-options">
        {question.options.map(option => <label key={option.id} className={`quiz-option${answer === option.id ? ' selected' : ''}`}>
          <input type="radio" name={question.id} value={option.id} checked={answer === option.id}
            onChange={() => onAnswer(option.id)} />
          <span>{option.label}</span>
        </label>)}
      </div>
      {answer && <button className="button small" type="button" onClick={() => onAnswer('')}>Снять выбор</button>}
    </fieldset>
    <label className="quiz-notes">
      <span>Моё объяснение — сниппет {question.id.replace('snippet-', '')} (необязательно)</span>
      <textarea value={explanation} maxLength={2000} rows={3} onChange={event => onExplanation(event.target.value)}
        placeholder="Почему? Пройди код по шагам и проверь последнюю итерацию." />
    </label>
    <p className="muted small">Объяснение сохраняется для самопроверки, но автоматически не оценивается.</p>
    {checkedAnswer && <div className="quiz-explanation" role="region" aria-label={`Разбор сниппета ${question.id.replace('snippet-', '')}`}>
      <p className={checkedAnswer === question.answerId ? 'success-text' : 'error-text'}>
        {checkedAnswer === question.answerId ? 'Верно.' : 'Ответ не совпал.'}
      </p>
      <p><strong>Правильный вариант:</strong> {answerOption?.label}</p>
      <Markdown text={content.explanation} path={path} />
    </div>}
  </section>;
}
