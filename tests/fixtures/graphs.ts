const islands = `
function numIslands(grid) {
  const rows = grid.length, cols = grid[0].length;
  let total = 0;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (grid[r][c] !== '1') continue;
    total++;
    grid[r][c] = '0';
    const stack = [[r, c]];
    while (stack.length) {
      const [row, col] = stack.pop();
      for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const nr = row + dr, nc = col + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] !== '1') continue;
        grid[nr][nc] = '0';
        stack.push([nr, nc]);
      }
    }
  }
  return total;
}`;

const oranges = `
function orangesRotting(grid) {
  const rows = grid.length, cols = grid[0].length, queue = [];
  let fresh = 0, time = 0;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (grid[r][c] === 1) fresh++;
    if (grid[r][c] === 2) queue.push([r, c, 0]);
  }
  for (let head = 0; head < queue.length; head++) {
    const [r, c, minute] = queue[head];
    for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] !== 1) continue;
      grid[nr][nc] = 2;
      fresh--;
      time = minute + 1;
      queue.push([nr, nc, time]);
    }
  }
  return fresh ? -1 : time;
}`;

const clone = `
function cloneGraph(node) {
  if (node === null) return null;
  const copies = new Map([[node, new Node(node.val)]]);
  const queue = [node];
  for (let head = 0; head < queue.length; head++) {
    const current = queue[head], copy = copies.get(current);
    for (const neighbor of [...current.neighbors].reverse()) {
      if (!copies.has(neighbor)) {
        copies.set(neighbor, new Node(neighbor.val));
        queue.push(neighbor);
      }
      copy.neighbors.push(copies.get(neighbor));
    }
  }
  return copies.get(node);
}`;

const wordSearch = `
function exist(board, word) {
  function visit(r, c, index) {
    if (index === word.length) return true;
    if (r < 0 || r >= board.length || c < 0 || c >= board[0].length || board[r][c] !== word[index]) return false;
    const saved = board[r][c];
    board[r][c] = '#';
    const found = visit(r+1,c,index+1) || visit(r-1,c,index+1) ||
      visit(r,c+1,index+1) || visit(r,c-1,index+1);
    board[r][c] = saved;
    return found;
  }
  for (let r = 0; r < board.length; r++) for (let c = 0; c < board[0].length; c++) {
    if (visit(r, c, 0)) return true;
  }
  return false;
}`;

const topological = `
function schedule(numCourses, prerequisites) {
  const edges = Array.from({length: numCourses}, () => []);
  const degree = Array(numCourses).fill(0), order = [];
  for (const [course, prerequisite] of prerequisites) {
    edges[prerequisite].push(course);
    degree[course]++;
  }
  for (let i = numCourses - 1; i >= 0; i--) if (!degree[i]) order.push(i);
  for (let head = 0; head < order.length; head++) {
    for (const next of edges[order[head]]) if (--degree[next] === 0) order.push(next);
  }
  return order;
}`;

export const graphSolutions: Record<string, string> = {
  'number-of-islands': islands,
  'rotting-oranges': oranges,
  'clone-graph': clone,
  'word-search': wordSearch,
  'course-schedule': `${topological}
    function canFinish(numCourses, prerequisites) { return schedule(numCourses, prerequisites).length === numCourses; }`,
  'course-schedule-ii': `${topological}
    function findOrder(numCourses, prerequisites) {
      const order = schedule(numCourses, prerequisites);
      return order.length === numCourses ? order : [];
    }`,
};

export const graphWrongSolutions: Record<string, string[]> = {
  'number-of-islands': [
    'function numIslands(grid) { return grid.flat().filter(cell => cell === 1).length; }',
    'function numIslands(grid) { return grid.flat().filter(cell => cell === "1").length; }',
    islands.replace('[[1,0],[-1,0],[0,1],[0,-1]]', '[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]'),
  ],
  'rotting-oranges': [
    'function orangesRotting() { return 0; }',
    oranges.replace('if (grid[r][c] === 2)', 'if (grid[r][c] === 2 && queue.length === 0)'),
    oranges.replace('return fresh ? -1 : time;', 'return fresh ? -1 : time + 1;'),
    oranges.replace('return fresh ? -1 : time;', 'return time;'),
  ],
  'clone-graph': [
    'function cloneGraph(node) { return node; }',
    'function cloneGraph(node) { return node === null ? null : new Node(node.val, node.neighbors); }',
    'function cloneGraph(node) { return node === null ? null : new Node(node.val); }',
    `function cloneGraph(node) {
      if (!node) return null;
      const root = new Node(node.val);
      root.neighbors = node.neighbors.map(neighbor => new Node(neighbor.val, [new Node(node.val)]));
      return root;
    }`,
    clone.replace('new Node(neighbor.val)', 'new Node(1)'),
    clone.replace('return copies.get(node);', 'return copies.get(queue[queue.length - 1]);'),
  ],
  'word-search': [
    'function exist() { return true; }',
    'function exist() { return false; }',
    wordSearch.replace("board[r][c] = '#';", ''),
    wordSearch.replace('board[r][c] = saved;', ''),
    wordSearch.replace('if (visit(r, c, 0))', 'if (r === 0 && c === 0 && visit(r, c, 0))'),
  ],
  'course-schedule': [
    'function canFinish() { return true; }',
    'function canFinish(numCourses, prerequisites) { return prerequisites.length === 0; }',
    `${topological}
      function canFinish(numCourses, prerequisites) { return schedule(numCourses, prerequisites).length > 0; }`,
    `function canFinish(numCourses, prerequisites) {
      const seen = new Set(), graph = Array.from({length:numCourses}, () => []);
      for (const [course, prerequisite] of prerequisites) graph[prerequisite].push(course);
      function visit(node) {
        if (seen.has(node)) return false;
        seen.add(node);
        return graph[node].every(visit);
      }
      for (let node = 0; node < numCourses; node++) if (!seen.has(node) && !visit(node)) return false;
      return true;
    }`,
  ],
  'course-schedule-ii': [
    'function findOrder() { return []; }',
    'function findOrder(numCourses) { return Array.from({length:numCourses}, (_, i) => i); }',
    `${topological}
      function findOrder(numCourses, prerequisites) { return schedule(numCourses, prerequisites); }`,
    `${topological}
      function findOrder(numCourses, prerequisites) {
        const order = schedule(numCourses, prerequisites.map(([a, b]) => [b, a]));
        return order.length === numCourses ? order : [];
      }`,
    'function findOrder(numCourses) { return Array(numCourses).fill(0); }',
  ],
};
