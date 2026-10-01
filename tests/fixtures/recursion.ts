// Trusted test-only source. Never import these fixtures into the task registry or UI.
export const recursionSolutions: Record<string, string> = {
  'fibonacci-memo': `function fibMemo(n, memo = new Map()) {
    if (n < 2) return n;
    if (memo.has(n)) return memo.get(n);
    const value = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
    memo.set(n, value);
    return value;
  }`,
  'power-and-reverse': `function power(base, exponent) {
    if (exponent === 0) return 1;
    const half = power(base, Math.floor(exponent / 2));
    return exponent % 2 === 0 ? half * half : base * half * half;
  }`,
  'reverse-string': `function reverseString(str) {
    if (str.length <= 1) return str;
    return reverseString(str.slice(1)) + str[0];
  }`,
  subsets: `function subsets(nums) {
    const result = [], path = [];
    function visit(start) {
      result.push([...path]);
      for (let i = start; i < nums.length; i++) {
        path.push(nums[i]);
        visit(i + 1);
        path.pop();
      }
    }
    visit(0);
    return result;
  }`,
  permutations: `function permute(nums) {
    const result = [], path = [], used = new Array(nums.length).fill(false);
    function visit() {
      if (path.length === nums.length) { result.push([...path]); return; }
      for (let i = 0; i < nums.length; i++) {
        if (used[i]) continue;
        used[i] = true;
        path.push(nums[i]);
        visit();
        path.pop();
        used[i] = false;
      }
    }
    visit();
    return result;
  }`,
  'flatten-nested': `function flatten(arr, depth = Infinity) {
    const result = [];
    function visit(items, remaining) {
      for (const item of items) {
        if (Array.isArray(item) && remaining > 0) visit(item, remaining - 1);
        else result.push(item);
      }
    }
    visit(arr, depth);
    return result;
  }`,
  'count-comments': `function countComments(comments) {
    let total = 0;
    for (const comment of comments) total += 1 + countComments(comment.replies ?? []);
    return total;
  }`,
  'deep-get': `function deepGet(obj, path) {
    let current = obj;
    for (const key of path.split('.')) {
      if (current == null) return undefined;
      current = current[key];
    }
    return current;
  }`,
};

// Every incorrect fixture has bounded loops/recursion or throws; no timeout-dependent hangs.
export const recursionWrongSolutions: Record<string, string[]> = {
  'fibonacci-memo': [
    recursionSolutions['fibonacci-memo'].replace('if (n < 2) return n;', 'if (n < 2) return 1;'),
    `function fibMemo(n) {
      let prev = 0, curr = 1;
      for (let i = 2; i < n; i++) [prev, curr] = [curr, prev + curr];
      return n === 0 ? 0 : curr;
    }`,
    `function fibMemo(n) {
      let prev = 0, curr = 1;
      for (let i = 2; i <= n; i++) { prev = curr; curr = prev + curr; }
      return n === 0 ? 0 : curr;
    }`,
    recursionSolutions['fibonacci-memo'].replace('return value;', 'return;'),
  ],
  'power-and-reverse': [
    recursionSolutions['power-and-reverse'].replace('exponent === 0) return 1', 'exponent === 0) return 0'),
    recursionSolutions['power-and-reverse'].replace('base * half * half', 'half * half'),
    `function power(base, exponent) { return base * exponent; }`,
    `function power(base, exponent) { return Math.round(Math.pow(base, exponent)); }`,
  ],
  'reverse-string': [
    `function reverseString(str) { return str; }`,
    `function reverseString(str) { return str.slice(1).split('').reverse().join(''); }`,
    `function reverseString(str) { return str.trim().split('').reverse().join(''); }`,
    recursionSolutions['reverse-string'].replace('return reverseString', 'reverseString'),
  ],
  subsets: [
    `function subsets(nums) { return [[], ...nums.map(n => [n])]; }`,
    recursionSolutions.subsets.replace('result.push([...path]);', 'if (path.length) result.push([...path]);'),
    recursionSolutions.subsets.replace('result.push([...path]);', 'result.push(path);'),
    recursionSolutions.subsets.replace('path.pop();', ''),
  ],
  permutations: [
    `function permute(nums) { return [[...nums]]; }`,
    recursionSolutions.permutations.replace('used[i] = false;', ''),
    recursionSolutions.permutations.replace('result.push([...path])', 'result.push(path)'),
    recursionSolutions.permutations.replace('return result;', 'return result.map(row => row.sort((a, b) => a - b));'),
  ],
  'flatten-nested': [
    `function flatten(arr, depth = Infinity) { return arr.flat(Infinity); }`,
    `function flatten(arr, depth = Infinity) { return depth === 0 ? arr : arr.flat(depth); }`,
    `function flatten(arr, depth = Infinity) { return arr.flat(depth).filter(Boolean); }`,
    `function flatten(arr, depth = Infinity) {
      const result = arr.flat(depth);
      arr.length = 0;
      return result;
    }`,
    recursionSolutions['flatten-nested'].replace('visit(item, remaining - 1)', 'visit(item, --remaining)'),
  ],
  'count-comments': [
    `function countComments(comments) { return comments.length; }`,
    `function countComments(comments) {
      return comments.reduce((n, comment) => n + 1 + countComments(comment.replies), 0);
    }`,
    `function countComments(comments) {
      let n = 0;
      while (comments.length) {
        const comment = comments.pop();
        n += 1 + countComments(comment.replies ?? []);
      }
      return n;
    }`,
    `function countComments(comments) {
      const ids = new Set(), queue = [...comments];
      for (let i = 0; i < queue.length; i++) {
        ids.add(queue[i].id);
        queue.push(...(queue[i].replies ?? []));
      }
      return ids.size;
    }`,
  ],
  'deep-get': [
    `function deepGet(obj, path) {
      let current = obj;
      for (const key of path.split('.')) {
        if (!current) return undefined;
        current = current[key];
      }
      return current || undefined;
    }`,
    recursionSolutions['deep-get'].replace('return undefined;', 'return null;'),
    `function deepGet(obj, path) { return obj[path]; }`,
    `function deepGet(obj, path) {
      let current = obj;
      for (const key of path.split('.')) current = current[key];
      return current;
    }`,
    `function deepGet(obj, path) {
      let current = obj;
      for (const key of path.split('.')) {
        if (current == null) return undefined;
        const next = current[key];
        if (typeof current === 'object') delete current[key];
        current = next;
      }
      return current;
    }`,
  ],
};
