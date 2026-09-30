import type { ScenarioCase } from '../types';

export const cases: ScenarioCase[] = [
  {
    name: 'Минимальная положительная пауза',
    input: 'sleep(1)',
    expected: 'pending до 1 мс, затем fulfilled(undefined)',
    script: `
      const promise = subject(1);
      assert(promise && typeof promise.then === 'function', 'Нужен промис');
      const result = observe(promise);
      await flush();
      assert.equal(result.status, 'pending', 'Не завершается в микрозадаче');
      await clock.tick(1);
      assert.equal(result.status, 'fulfilled', 'Пауза завершилась');
      assert(result.value === undefined, 'Значение — undefined');
    `,
  },
  {
    name: 'Не раньше заданной задержки',
    input: 'sleep(40); tick(39); tick(1)',
    expected: 'pending после 39 мс, fulfilled после 40 мс',
    script: `
      const start = clock.now();
      const result = observe(subject(40));
      await clock.tick(39);
      assert.equal(result.status, 'pending', 'Раннее завершение запрещено');
      await clock.tick(1);
      assert.equal(result.status, 'fulfilled', 'Таймер должен завершить паузу');
      assert.equal(clock.now() - start, 40, 'Используем относительное время');
    `,
  },
  {
    name: 'Нулевая пауза — таймер, не микрозадача',
    input: 'sleep(0); flush(); tick(0)',
    expected: 'pending до обработки таймеров, затем undefined',
    script: `
      const result = observe(subject(0));
      await flush();
      assert.equal(result.status, 'pending', 'sleep(0) не Promise.resolve()');
      await clock.tick(0);
      assert.equal(result.status, 'fulfilled', 'Нулевой таймер сработал');
      assert(result.value === undefined, 'Не возвращай ID таймера');
    `,
  },
  {
    name: 'Значение и освобождение таймера',
    input: 'sleep(15)',
    expected: 'fulfilled(undefined), активных таймеров нет',
    script: `
      const baseline = clock.pending();
      const result = observe(subject(15));
      await clock.tick(15);
      assert.equal(result.status, 'fulfilled', 'Промис выполнен');
      assert(result.value === undefined, 'Нельзя возвращать ms или ID таймера');
      assert.equal(clock.pending(), baseline, 'После sleep нет активных таймеров');
    `,
  },
  {
    name: 'Параллельные паузы независимы',
    input: 'sleep(30) и sleep(10)',
    expected: 'Короткая завершается первой, длинная продолжает ждать',
    script: `
      const slow = observe(subject(30));
      const fast = observe(subject(10));
      await clock.tick(10);
      assert.equal(fast.status, 'fulfilled', 'Короткая пауза завершена');
      assert.equal(slow.status, 'pending', 'Длинная ещё ждёт');
      await clock.tick(20);
      assert.equal(slow.status, 'fulfilled', 'Длинная пауза тоже завершается');
    `,
  },
  {
    name: 'Вызов не продвигает часы и не мешает другим таймерам',
    input: 'sleep(100); независимый таймер на 5 мс',
    expected: 'Управление возвращается сразу, другой таймер работает',
    script: `
      const start = clock.now();
      const result = observe(subject(100));
      assert.equal(clock.now(), start, 'Вызов не должен ждать синхронно');
      let otherRan = false;
      setTimeout(() => { otherRan = true; }, 5);
      await clock.tick(5);
      assert(otherRan, 'Другой таймер не заблокирован');
      assert.equal(result.status, 'pending', 'Пауза ещё не закончилась');
      await clock.tick(95);
      assert.equal(result.status, 'fulfilled', 'Пауза заканчивается на своей границе');
    `,
  },
];
