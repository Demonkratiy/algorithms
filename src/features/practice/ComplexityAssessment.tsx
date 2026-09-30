import { useId } from 'react';
import type { ComplexityChoices, ComplexityDefinition } from '../../../tasks/types';
import { complexityFeedback, type ComplexitySnapshot } from './complexity';

export function ComplexityAssessment({ definition, choices, onChange, disabled, legacyTime, legacySpace }: {
  definition: ComplexityDefinition; choices: ComplexityChoices;
  onChange: (choices: ComplexityChoices) => void; disabled: boolean;
  legacyTime: string; legacySpace: string;
}) {
  const groupId = useId();
  return <details className="card assessment complexity-assessment">
    <summary>Моя оценка сложности</summary>
    <p className="small muted">{definition.variables}</p>
    <p className="small muted">Выбери оценку своего кода. Сверка с целью задачи появится после успешной проверки тестов. Заполнять все пункты для запуска не обязательно.</p>
    {definition.criteria.map(criterion => <fieldset className="complexity-field" key={criterion.id} disabled={disabled}>
      <legend>{criterion.title}</legend>
      <div className="complexity-options">{definition.options.map(option => <label className="complexity-option" key={option.id}>
        <input type="radio" name={`${groupId}-${criterion.id}`} value={option.id}
          checked={choices[criterion.id] === option.id}
          onChange={() => onChange({ ...choices, [criterion.id]: option.id })} />
        <span>{option.label}</span>
      </label>)}</div>
      {choices[criterion.id] && !definition.options.some(option => option.id === choices[criterion.id])
        && <p className="notice small">Ранее выбранный вариант больше недоступен. Выбери новый.</p>}
    </fieldset>)}
    <button className="button small" disabled={disabled || Object.keys(choices).length === 0} onClick={() => onChange({})}>Очистить выбор оценок</button>
    {(legacyTime || legacySpace) && <details className="legacy-complexity">
      <summary>Прежние текстовые оценки</summary>
      <p className="small muted">Сохранены без изменений. Они не преобразуются в варианты автоматически.</p>
      {legacyTime && <p>Время: {legacyTime}</p>}
      {legacySpace && <p>Память: {legacySpace}</p>}
    </details>}
  </details>;
}

export function ComplexityFeedback({ definition, choices, code, snapshot }: {
  definition: ComplexityDefinition; choices: ComplexityChoices; code: string; snapshot: ComplexitySnapshot;
}) {
  const feedback = complexityFeedback(definition, code, choices, snapshot);
  return <section className="complexity-feedback" aria-label="Сверка оценки сложности">
    <h3>Оценка сложности</h3>
    {feedback.kind === 'stale' ? <p className="notice small">Код или выбранные оценки изменились. Сверка устарела — нажми «Проверить решение» заново.</p>
      : feedback.kind === 'blocked' ? <p>Сначала добейся успешного прохождения тестов. Выбор сохранён, но оценка пока не сверяется.</p>
      : <>
        <p className={feedback.kind === 'match' ? 'success-text' : ''}>
          {feedback.kind === 'incomplete' ? 'Оценка сложности пока не заполнена полностью.'
            : feedback.kind === 'match' ? 'Выбранные оценки совпадают с целевыми.'
            : 'Некоторые выбранные оценки отличаются от целевых.'}
        </p>
        <ul>{feedback.comparisons.map(item => <li key={item.id}>
          <strong>{item.title}</strong>
          <div>Твой выбор: {item.selected}.</div>
          {item.outcome !== 'unanswered' && <>
            <div>Цель задачи: {item.expected}. {item.outcome === 'match' ? 'Оценки совпадают.' : 'Оценки отличаются.'}</div>
            <p className="small muted">{item.outcome === 'different' && 'Если твой код действительно имеет выбранную сложность, сравни его с требованием задачи. '}{item.explanation}</p>
          </>}
        </li>)}</ul>
      </>}
    <p className="small muted">Сложность самого кода автоматически не подтверждена. Это сравнение твоего выбора с целью задачи, а не анализ алгоритма.</p>
  </section>;
}
