// Trusted programs for tests only; never import into learner-facing code.
export const binaryTreeSolutions: Record<string, string> = {
  'max-depth': `function maxDepth(root) {
    if (root === null) return 0;
    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
  }`,
  'min-depth': `function minDepth(root) {
    if (root === null) return 0;
    if (root.left === null) return 1 + minDepth(root.right);
    if (root.right === null) return 1 + minDepth(root.left);
    return 1 + Math.min(minDepth(root.left), minDepth(root.right));
  }`,
  'invert-tree': `function invertTree(root) {
    if (root === null) return null;
    const left = invertTree(root.left);
    root.left = invertTree(root.right);
    root.right = left;
    return root;
  }`,
  'level-order': `function levelOrder(root) {
    let level = root === null ? [] : [root];
    const result = [];
    while (level.length > 0) {
      const next = [], values = [];
      for (const node of level) {
        values.push(node.val);
        if (node.left !== null) next.push(node.left);
        if (node.right !== null) next.push(node.right);
      }
      result.push(values);
      level = next;
    }
    return result;
  }`,
  'validate-bst': `function isValidBST(root) {
    function visit(node, low, high) {
      if (node === null) return true;
      return node.val > low && node.val < high
        && visit(node.left, low, node.val)
        && visit(node.right, node.val, high);
    }
    return visit(root, -Infinity, Infinity);
  }`,
  'diameter': `function diameterOfBinaryTree(root) {
    let diameter = 0;
    function height(node) {
      if (node === null) return 0;
      const left = height(node.left), right = height(node.right);
      diameter = Math.max(diameter, left + right);
      return 1 + Math.max(left, right);
    }
    height(root);
    return diameter;
  }`,
  'lowest-common-ancestor': `function lowestCommonAncestorBST(root, p, q) {
    while (root !== null) {
      if (p.val < root.val && q.val < root.val) root = root.left;
      else if (p.val > root.val && q.val > root.val) root = root.right;
      else return root;
    }
    return null;
  }`,
  'lowest-common-ancestor-binary-tree': `function lowestCommonAncestor(root, p, q) {
    if (root === null || root === p || root === q) return root;
    const left = lowestCommonAncestor(root.left, p, q);
    const right = lowestCommonAncestor(root.right, p, q);
    if (left !== null && right !== null) return root;
    return left !== null ? left : right;
  }`,
};

export const binaryTreeAlternativeSolutions: Record<string, string[]> = {
  'max-depth': [
    `function maxDepth(root) {
      let level = root === null ? [] : [root], depth = 0;
      while (level.length > 0) {
        const next = [];
        for (const node of level) {
          if (node.left !== null) next.push(node.left);
          if (node.right !== null) next.push(node.right);
        }
        depth++;
        level = next;
      }
      return depth;
    }`,
    `function maxDepth(root) {
      const stack = root === null ? [] : [[root, 1]];
      let depth = 0;
      while (stack.length > 0) {
        const [node, current] = stack.pop();
        depth = Math.max(depth, current);
        if (node.right !== null) stack.push([node.right, current + 1]);
        if (node.left !== null) stack.push([node.left, current + 1]);
      }
      return depth;
    }`,
  ],
  'min-depth': [
    `function minDepth(root) {
      let level = root === null ? [] : [root], depth = 1;
      while (level.length > 0) {
        const next = [];
        for (const node of level) {
          if (node.left === null && node.right === null) return depth;
          if (node.left !== null) next.push(node.left);
          if (node.right !== null) next.push(node.right);
        }
        depth++;
        level = next;
      }
      return 0;
    }`,
  ],
  'invert-tree': [
    `function invertTree(root) {
      const stack = root === null ? [] : [root];
      while (stack.length > 0) {
        const node = stack.pop();
        [node.left, node.right] = [node.right, node.left];
        if (node.left !== null) stack.push(node.left);
        if (node.right !== null) stack.push(node.right);
      }
      return root;
    }`,
  ],
  'level-order': [
    `function levelOrder(root) {
      const result = [];
      function visit(node, depth) {
        if (node === null) return;
        (result[depth] ??= []).push(node.val);
        visit(node.left, depth + 1);
        visit(node.right, depth + 1);
      }
      visit(root, 0);
      return result;
    }`,
  ],
  'validate-bst': [
    `function isValidBST(root) {
      const stack = [];
      let node = root, previous = -Infinity;
      while (node !== null || stack.length > 0) {
        while (node !== null) { stack.push(node); node = node.left; }
        node = stack.pop();
        if (node.val <= previous) return false;
        previous = node.val;
        node = node.right;
      }
      return true;
    }`,
  ],
  'diameter': [
    `function diameterOfBinaryTree(root) {
      const stack = root === null ? [] : [[root, false]], heights = new Map();
      let diameter = 0;
      while (stack.length > 0) {
        const [node, visited] = stack.pop();
        if (visited) {
          const left = heights.get(node.left) ?? 0, right = heights.get(node.right) ?? 0;
          heights.set(node, 1 + Math.max(left, right));
          diameter = Math.max(diameter, left + right);
        } else {
          stack.push([node, true]);
          if (node.right !== null) stack.push([node.right, false]);
          if (node.left !== null) stack.push([node.left, false]);
        }
      }
      return diameter;
    }`,
  ],
  'lowest-common-ancestor': [
    `function lowestCommonAncestorBST(root, p, q) {
      if (root === null) return null;
      if (p.val < root.val && q.val < root.val) return lowestCommonAncestorBST(root.left, p, q);
      if (p.val > root.val && q.val > root.val) return lowestCommonAncestorBST(root.right, p, q);
      return root;
    }`,
  ],
  'lowest-common-ancestor-binary-tree': [
    `function lowestCommonAncestor(root, p, q) {
      const parents = new Map([[root, null]]), stack = [root];
      while (stack.length > 0) {
        const node = stack.pop();
        for (const child of [node.left, node.right]) {
          if (child !== null) { parents.set(child, node); stack.push(child); }
        }
      }
      const ancestors = new Set();
      for (let node = p; node !== null; node = parents.get(node)) ancestors.add(node);
      for (let node = q; node !== null; node = parents.get(node)) {
        if (ancestors.has(node)) return node;
      }
      return null;
    }`,
  ],
};

export const binaryTreeWrongSolutions: Record<string, string[]> = {
  'max-depth': [
    binaryTreeSolutions['max-depth'].replace('Math.max', 'Math.min'),
    binaryTreeSolutions['max-depth'].replace('return 0;', 'return -1;'),
    `function maxDepth(root) {
      if (root === null) return 0;
      return 1 + maxDepth(root.left) + maxDepth(root.right);
    }`,
    `function maxDepth(root) { return root.length; }`,
  ],
  'min-depth': [
    `function minDepth(root) {
      if (root === null) return 0;
      return 1 + Math.min(minDepth(root.left), minDepth(root.right));
    }`,
    binaryTreeSolutions['max-depth'].replaceAll('maxDepth', 'minDepth'),
    binaryTreeSolutions['min-depth'].replace('return 0;', 'return -1;'),
    `function minDepth(root) {
      if (root === null) return 0;
      return 1 + minDepth(root.left);
    }`,
  ],
  'invert-tree': [
    `function invertTree(root) { return root; }`,
    `function invertTree(root) {
      if (root !== null) [root.left, root.right] = [root.right, root.left];
      return root;
    }`,
    `function invertTree(root) {
      if (root === null) return null;
      root.left = root.right;
      root.right = root.left;
      return root;
    }`,
    `function invertTree(root) {
      if (root === null) return null;
      return new TreeNode(root.val, invertTree(root.right), invertTree(root.left));
    }`,
    binaryTreeSolutions['invert-tree'].replace('return root;', ''),
    `function invertTree(root) { if (root !== null) root.left = root; return root; }`,
  ],
  'level-order': [
    binaryTreeSolutions['level-order'].replace('return result;', 'return result.flat();'),
    binaryTreeSolutions['level-order'].replace('result.push(values);', 'result.push(values.reverse());'),
    binaryTreeSolutions['level-order'].replace('return result;', 'return result.reverse();'),
    binaryTreeSolutions['level-order'].replace('const result = [];', 'const result = [[]];'),
    `function levelOrder(root) {
      if (root === null) return [];
      const queue = [root], result = [];
      let head = 0;
      while (head < queue.length) {
        const values = [];
        for (; head < queue.length; head++) {
          const node = queue[head];
          values.push(node.val);
          if (node.left !== null) queue.push(node.left);
          if (node.right !== null) queue.push(node.right);
        }
        result.push(values);
      }
      return result;
    }`,
  ],
  'validate-bst': [
    `function isValidBST(root) {
      if (root === null) return true;
      if (root.left !== null && root.left.val >= root.val) return false;
      if (root.right !== null && root.right.val <= root.val) return false;
      return isValidBST(root.left) && isValidBST(root.right);
    }`,
    binaryTreeSolutions['validate-bst'].replace('node.val > low && node.val < high', 'node.val >= low && node.val <= high'),
    binaryTreeSolutions['validate-bst'].replace('visit(root, -Infinity, Infinity)', 'visit(root, -2147483648, 2147483647)'),
    `function isValidBST(root) { return true; }`,
  ],
  'diameter': [
    binaryTreeSolutions['diameter'].replace('diameter, left + right', 'diameter, left + right + 1'),
    `function diameterOfBinaryTree(root) {
      function height(node) {
        return node === null ? 0 : 1 + Math.max(height(node.left), height(node.right));
      }
      return root === null ? 0 : height(root.left) + height(root.right);
    }`,
    binaryTreeSolutions['diameter'].replace('return 1 + Math.max(left, right);', 'return left + right;'),
    binaryTreeSolutions['max-depth'].replaceAll('maxDepth', 'diameterOfBinaryTree'),
  ],
  'lowest-common-ancestor': [
    binaryTreeSolutions['lowest-common-ancestor'].replace('else return root;', 'else return root.val;'),
    binaryTreeSolutions['lowest-common-ancestor'].replace('else return root;', 'else return new TreeNode(root.val, root.left, root.right);'),
    `function lowestCommonAncestorBST(root, p, q) { return root; }`,
    binaryTreeSolutions['lowest-common-ancestor'].replaceAll('p.val < root.val', 'p.val <= root.val').replaceAll('q.val < root.val', 'q.val <= root.val').replaceAll('p.val > root.val', 'p.val >= root.val').replaceAll('q.val > root.val', 'q.val >= root.val'),
  ],
  'lowest-common-ancestor-binary-tree': [
    binaryTreeSolutions['lowest-common-ancestor'].replaceAll('lowestCommonAncestorBST', 'lowestCommonAncestor'),
    `function lowestCommonAncestor(root, p, q) { return root; }`,
    binaryTreeSolutions['lowest-common-ancestor-binary-tree'].replace('return root;', 'return root === null ? null : root.val;'),
    binaryTreeSolutions['lowest-common-ancestor-binary-tree'].replace('return root;', 'return root === null ? null : new TreeNode(root.val, root.left, root.right);'),
    binaryTreeSolutions['lowest-common-ancestor-binary-tree'].replace('root === null || root === p || root === q', 'root === null'),
  ],
};
