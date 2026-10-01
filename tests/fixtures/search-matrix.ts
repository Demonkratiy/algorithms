// Trusted implementations for automated tests only. Never import into the application.
export const searchMatrixSolutions: Record<string, string> = {
  'binary-search-basic': `function search(nums, target) {
    let left = 0, right = nums.length - 1;
    while (left <= right) {
      const mid = left + Math.floor((right - left) / 2);
      if (nums[mid] === target) return mid;
      if (nums[mid] < target) left = mid + 1;
      else right = mid - 1;
    }
    return -1;
  }`,
  'search-insert-position': `function searchInsert(nums, target) {
    let left = 0, right = nums.length;
    while (left < right) {
      const mid = left + Math.floor((right - left) / 2);
      if (nums[mid] >= target) right = mid;
      else left = mid + 1;
    }
    return left;
  }`,
  'first-last-position': `function searchRange(nums, target) {
    function boundary(strict) {
      let left = 0, right = nums.length;
      while (left < right) {
        const mid = left + Math.floor((right - left) / 2);
        if (nums[mid] > target || (!strict && nums[mid] === target)) right = mid;
        else left = mid + 1;
      }
      return left;
    }
    const first = boundary(false);
    if (first === nums.length || nums[first] !== target) return [-1, -1];
    return [first, boundary(true) - 1];
  }`,
  'koko-eating-bananas': `function minEatingSpeed(piles, h) {
    let left = 1, right = 1;
    for (const pile of piles) right = Math.max(right, pile);
    while (left < right) {
      const mid = left + Math.floor((right - left) / 2);
      let hours = 0;
      for (const pile of piles) hours += Math.ceil(pile / mid);
      if (hours <= h) right = mid;
      else left = mid + 1;
    }
    return left;
  }`,
  'search-rotated-array': `function search(nums, target) {
    let left = 0, right = nums.length - 1;
    while (left <= right) {
      const mid = left + Math.floor((right - left) / 2);
      if (nums[mid] === target) return mid;
      if (nums[left] <= nums[mid]) {
        if (nums[left] <= target && target < nums[mid]) right = mid - 1;
        else left = mid + 1;
      } else {
        if (nums[mid] < target && target <= nums[right]) left = mid + 1;
        else right = mid - 1;
      }
    }
    return -1;
  }`,
  'sqrt': `function mySqrt(x) {
    if (x < 2) return x;
    let left = 1, right = Math.floor(x / 2), answer = 1;
    while (left <= right) {
      const mid = left + Math.floor((right - left) / 2);
      if (mid <= x / mid) {
        answer = mid;
        left = mid + 1;
      } else right = mid - 1;
    }
    return answer;
  }`,
  'rotate-image': `function rotate(matrix) {
    for (let r = 0; r < matrix.length; r++) {
      for (let c = r + 1; c < matrix.length; c++) {
        const saved = matrix[r][c];
        matrix[r][c] = matrix[c][r];
        matrix[c][r] = saved;
      }
    }
    for (const row of matrix) row.reverse();
  }`,
  'spiral-matrix': `function spiralOrder(matrix) {
    const result = [];
    let top = 0, bottom = matrix.length - 1, left = 0, right = matrix[0].length - 1;
    while (top <= bottom && left <= right) {
      for (let c = left; c <= right; c++) result.push(matrix[top][c]);
      top++;
      for (let r = top; r <= bottom; r++) result.push(matrix[r][right]);
      right--;
      if (top <= bottom) {
        for (let c = right; c >= left; c--) result.push(matrix[bottom][c]);
        bottom--;
      }
      if (left <= right) {
        for (let r = bottom; r >= top; r--) result.push(matrix[r][left]);
        left++;
      }
    }
    return result;
  }`,
  'set-matrix-zeroes': `function setZeroes(matrix) {
    const rows = matrix.length, cols = matrix[0].length;
    let firstRow = false, firstCol = false;
    for (let c = 0; c < cols; c++) if (matrix[0][c] === 0) firstRow = true;
    for (let r = 0; r < rows; r++) if (matrix[r][0] === 0) firstCol = true;
    for (let r = 1; r < rows; r++) {
      for (let c = 1; c < cols; c++) {
        if (matrix[r][c] === 0) { matrix[r][0] = 0; matrix[0][c] = 0; }
      }
    }
    for (let r = 1; r < rows; r++) {
      for (let c = 1; c < cols; c++) {
        if (matrix[r][0] === 0 || matrix[0][c] === 0) matrix[r][c] = 0;
      }
    }
    if (firstRow) for (let c = 0; c < cols; c++) matrix[0][c] = 0;
    if (firstCol) for (let r = 0; r < rows; r++) matrix[r][0] = 0;
  }`,
};

export const searchMatrixWrongSolutions: Record<string, string[]> = {
  'binary-search-basic': [
    searchMatrixSolutions['binary-search-basic'].replace('left <= right', 'left < right'),
    searchMatrixSolutions['binary-search-basic'].replace('return -1;', 'return left;'),
  ],
  'search-insert-position': [
    searchMatrixSolutions['search-insert-position'].replace('right = nums.length;', 'right = nums.length - 1;'),
    searchMatrixSolutions['search-insert-position'].replace('nums[mid] >= target', 'nums[mid] > target'),
    `function searchInsert(nums, target) { return nums.indexOf(target); }`,
  ],
  'first-last-position': [
    `function searchRange(nums, target) {
      const index = nums.indexOf(target);
      return [index, index];
    }`,
    searchMatrixSolutions['first-last-position'].replace('boundary(true) - 1', 'boundary(true)'),
    searchMatrixSolutions['first-last-position'].replace('if (first === nums.length || nums[first] !== target) return [-1, -1];', ''),
  ],
  'koko-eating-bananas': [
    searchMatrixSolutions['koko-eating-bananas'].replace('Math.ceil(pile / mid)', 'Math.floor(pile / mid)'),
    `function minEatingSpeed(piles, h) { return Math.ceil(piles.reduce((sum, pile) => sum + pile, 0) / h); }`,
    searchMatrixSolutions['koko-eating-bananas'].replace(
      'let left = 1, right = 1;',
      'if ((piles.reduce((sum, pile) => sum + pile, 0) | 0) <= h) return 1; let left = 1, right = 1;',
    ),
  ],
  'search-rotated-array': [
    searchMatrixSolutions['binary-search-basic'],
    searchMatrixSolutions['search-rotated-array'].replace('nums[left] <= nums[mid]', 'nums[left] < nums[mid]'),
    `function search(nums, target) { return [...nums].sort((a, b) => a - b).indexOf(target); }`,
  ],
  'sqrt': [
    `function mySqrt(x) { return Math.round(Math.sqrt(x)); }`,
    searchMatrixSolutions['sqrt'].replace('if (x < 2) return x;', 'if (x < 2) return 1;'),
    `function mySqrt(x) {
      let left = 0, right = 46341, answer = 0;
      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if ((mid * mid | 0) <= x) { answer = mid; left = mid + 1; }
        else right = mid - 1;
      }
      return answer;
    }`,
  ],
  'rotate-image': [
    `function rotate(matrix) {
      return matrix.map((row, r) => row.map((_, c) => matrix[matrix.length - 1 - c][r]));
    }`,
    searchMatrixSolutions['rotate-image'].replace('for (const row of matrix) row.reverse();', 'matrix.reverse();'),
    searchMatrixSolutions['rotate-image'].replace('for (const row of matrix) row.reverse();', ''),
  ],
  'spiral-matrix': [
    `function spiralOrder(matrix) { return matrix.flat(); }`,
    searchMatrixSolutions['spiral-matrix'].replace('if (top <= bottom)', 'if (true)').replace('if (left <= right)', 'if (true)'),
    searchMatrixSolutions['spiral-matrix'].replace('right = matrix[0].length - 1', 'right = matrix.length - 1'),
  ],
  'set-matrix-zeroes': [
    `function setZeroes(matrix) {
      return matrix.map((row, r) => row.map((value, c) =>
        matrix[r].includes(0) || matrix.some(line => line[c] === 0) ? 0 : value));
    }`,
    `function setZeroes(matrix) {
      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[0].length; c++) {
          if (matrix[r][c] === 0) {
            for (let i = 0; i < matrix.length; i++) matrix[i][c] = 0;
            matrix[r].fill(0);
          }
        }
      }
    }`,
    searchMatrixSolutions['set-matrix-zeroes'].replace('if (firstCol)', 'if (firstRow)'),
    `function setZeroes(matrix) {
      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[0].length; c++) {
          if (matrix[r][c] === 0) {
            for (let i = 0; i < matrix.length; i++) if (matrix[i][c] !== 0) matrix[i][c] = -1;
            for (let j = 0; j < matrix[0].length; j++) if (matrix[r][j] !== 0) matrix[r][j] = -1;
          }
        }
      }
      for (const row of matrix) for (let c = 0; c < row.length; c++) if (row[c] === -1) row[c] = 0;
    }`,
  ],
};
