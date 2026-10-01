// Trusted test-only implementations. Never import this file into the app.
export const stackQueueSolutions: Record<string, string> = {
  'valid-parentheses': `function isValid(s) {
    const pairs = { ')': '(', ']': '[', '}': '{' };
    const stack = [];
    for (const c of s) {
      if ('([{'.includes(c)) stack.push(c);
      else if (stack.pop() !== pairs[c]) return false;
    }
    return stack.length === 0;
  }`,
  'min-stack': `class MinStack {
    constructor() { this.values = []; this.mins = []; }
    push(val) {
      this.values.push(val);
      this.mins.push(Math.min(val, this.mins.at(-1) ?? Infinity));
    }
    pop() { this.mins.pop(); this.values.pop(); }
    top() { return this.values.at(-1); }
    getMin() { return this.mins.at(-1); }
  }`,
  'daily-temperatures': `function dailyTemperatures(temperatures) {
    const answer = Array(temperatures.length).fill(0), stack = [];
    for (let i = 0; i < temperatures.length; i++) {
      while (stack.length && temperatures[i] > temperatures[stack.at(-1)]) {
        const prev = stack.pop();
        answer[prev] = i - prev;
      }
      stack.push(i);
    }
    return answer;
  }`,
  'evaluate-rpn': `function evalRPN(tokens) {
    const stack = [];
    for (const token of tokens) {
      if (['+', '-', '*', '/'].includes(token)) {
        const b = stack.pop(), a = stack.pop();
        stack.push(token === '+' ? a + b : token === '-' ? a - b : token === '*' ? a * b : Math.trunc(a / b));
      } else stack.push(Number(token));
    }
    return stack.pop();
  }`,
  'queue-via-stacks': `class MyQueue {
    constructor() { this.input = []; this.output = []; }
    push(x) { this.input.push(x); }
    transfer() {
      if (!this.output.length) while (this.input.length) this.output.push(this.input.pop());
    }
    pop() { this.transfer(); return this.output.pop(); }
    peek() { this.transfer(); return this.output.at(-1); }
    empty() { return !this.input.length && !this.output.length; }
  }`,
}

export const stackQueueWrongSolutions: Record<string, string[]> = {
  'valid-parentheses': [
    stackQueueSolutions['valid-parentheses'].replace('return stack.length === 0;', 'return true;'),
    `function isValid(s) {
      return [...'([{'].every((c, i) => [...s].filter(x => x === c).length === [...s].filter(x => x === ')]}'[i]).length);
    }`,
    stackQueueSolutions['valid-parentheses'].replace("stack.pop() !== pairs[c]", "!stack.pop()"),
  ],
  'min-stack': [
    stackQueueSolutions['min-stack'].replace('this.mins.pop();', ''),
    stackQueueSolutions['min-stack'].replace('return this.values.at(-1);', 'return this.values.pop();'),
    stackQueueSolutions['min-stack'].replace('return this.values.at(-1);', 'return this.mins.at(-1);'),
    stackQueueSolutions['min-stack'].replace('return this.mins.at(-1);', 'return this.mins.pop();'),
    stackQueueSolutions['min-stack'].replace('this.values = []; this.mins = [];', 'this.values = MinStack.values ??= []; this.mins = MinStack.mins ??= [];'),
    `class MinStack {
      constructor() { this.values = []; this.mins = []; }
      push(val) { this.values.push(val); if (!this.mins.length || val < this.mins.at(-1)) this.mins.push(val); }
      pop() { if (this.values.pop() === this.mins.at(-1)) this.mins.pop(); }
      top() { return this.values.at(-1); }
      getMin() { return this.mins.at(-1); }
    }`,
  ],
  'daily-temperatures': [
    stackQueueSolutions['daily-temperatures'].replace('temperatures[i] > temperatures', 'temperatures[i] >= temperatures'),
    stackQueueSolutions['daily-temperatures'].replace('while (stack.length', 'if (stack.length'),
    stackQueueSolutions['daily-temperatures'].replace('i - prev;', 'i - prev + 1;'),
    stackQueueSolutions['daily-temperatures'].replace('.fill(0)', '.fill(-1)'),
  ],
  'evaluate-rpn': [
    stackQueueSolutions['evaluate-rpn'].replace('Math.trunc(a / b)', 'Math.floor(a / b)'),
    stackQueueSolutions['evaluate-rpn'].replace('Math.trunc(a / b)', 'a / b'),
    stackQueueSolutions['evaluate-rpn'].replace('Math.trunc(a / b)', '(a / b) | 0'),
    stackQueueSolutions['evaluate-rpn'].replace('const b = stack.pop(), a = stack.pop();', 'const a = stack.pop(), b = stack.pop();'),
    stackQueueSolutions['evaluate-rpn'].replace('stack.push(Number(token))', 'stack.push(token)'),
    stackQueueSolutions['evaluate-rpn'].replace("['+', '-', '*', '/'].includes(token)", "'+-*/'.includes(token[0])"),
  ],
  'queue-via-stacks': [
    stackQueueSolutions['queue-via-stacks'].replace('if (!this.output.length) ', ''),
    stackQueueSolutions['queue-via-stacks'].replace('return this.output.at(-1);', 'return this.output.pop();'),
    stackQueueSolutions['queue-via-stacks'].replace('peek() { this.transfer();', 'peek() {'),
    stackQueueSolutions['queue-via-stacks'].replace('return this.output.pop();', 'this.output.pop();'),
    stackQueueSolutions['queue-via-stacks'].replace('!this.input.length && !this.output.length', '!this.input.length'),
    stackQueueSolutions['queue-via-stacks'].replace('!this.input.length && !this.output.length', '!this.output.length'),
    stackQueueSolutions['queue-via-stacks'].replace('this.input = []; this.output = [];', 'this.input = MyQueue.input ??= []; this.output = MyQueue.output ??= [];'),
    `class MyQueue {
      constructor() { this.items = []; }
      push(x) { this.items.push(x); }
      pop() { return this.items.pop(); }
      peek() { return this.items.at(-1); }
      empty() { return this.items.length === 0; }
    }`,
  ],
}
