// Trusted test-only source. Never import these fixtures into the task registry or UI.
export const dpSolutions: Record<string, string> = {
  'climbing-stairs': `function climbStairs(n) {
    let previous = 1, current = 1;
    for (let i = 2; i <= n; i++) [previous, current] = [current, previous + current];
    return current;
  }`,
  'house-robber': `function rob(nums) {
    let before = 0, best = 0;
    for (const value of nums) [before, best] = [best, Math.max(best, before + value)];
    return best;
  }`,
  'house-robber-ii': `function robCircular(nums) {
    if (nums.length === 1) return nums[0];
    function range(start, end) {
      let before = 0, best = 0;
      for (let i = start; i < end; i++) [before, best] = [best, Math.max(best, before + nums[i])];
      return best;
    }
    return Math.max(range(0, nums.length - 1), range(1, nums.length));
  }`,
  'coin-change': `function coinChange(coins, amount) {
    const dp = Array(amount + 1).fill(Infinity);
    dp[0] = 0;
    for (let sum = 1; sum <= amount; sum++) {
      for (const coin of coins) {
        if (coin <= sum) dp[sum] = Math.min(dp[sum], dp[sum - coin] + 1);
      }
    }
    return dp[amount] === Infinity ? -1 : dp[amount];
  }`,
  'coin-change-ii': `function change(amount, coins) {
    const dp = Array(amount + 1).fill(0);
    dp[0] = 1;
    for (const coin of coins) {
      for (let sum = coin; sum <= amount; sum++) dp[sum] += dp[sum - coin];
    }
    return dp[amount];
  }`,
  'longest-increasing-subsequence': `function lengthOfLIS(nums) {
    const dp = Array(nums.length).fill(1);
    for (let i = 0; i < nums.length; i++) {
      for (let j = 0; j < i; j++) {
        if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
    return Math.max(...dp);
  }`,
  'unique-paths': `function uniquePaths(m, n) {
    const row = Array(n).fill(1);
    for (let r = 1; r < m; r++) {
      for (let c = 1; c < n; c++) row[c] += row[c - 1];
    }
    return row[n - 1];
  }`,
  'unique-paths-ii': `function uniquePathsWithObstacles(obstacleGrid) {
    const row = Array(obstacleGrid[0].length).fill(0);
    row[0] = 1;
    for (const cells of obstacleGrid) {
      for (let c = 0; c < cells.length; c++) {
        if (cells[c] === 1) row[c] = 0;
        else if (c > 0) row[c] += row[c - 1];
      }
    }
    return row[row.length - 1];
  }`,
};

export const dpWrongSolutions: Record<string, string[]> = {
  'climbing-stairs': [
    // Fibonacci bases rather than stair-count bases.
    `function climbStairs(n) {
      let a = 0, b = 1;
      for (let i = 1; i < n; i++) [a, b] = [b, a + b];
      return b;
    }`,
    // Lost previous state.
    `function climbStairs(n) {
      let a = 1, b = 1;
      for (let i = 2; i <= n; i++) { a = b; b = a + b; }
      return b;
    }`,
    // Missing last iteration.
    `function climbStairs(n) {
      let a = 1, b = 1;
      for (let i = 2; i < n; i++) [a, b] = [b, a + b];
      return b;
    }`,
    // Counting unordered sets of one- and two-step moves.
    `function climbStairs(n) { return Math.floor(n / 2) + 1; }`,
  ],
  'house-robber': [
    `function rob(nums) {
      return Math.max(
        nums.reduce((s, n, i) => s + (i % 2 === 0 ? n : 0), 0),
        nums.reduce((s, n, i) => s + (i % 2 === 1 ? n : 0), 0));
    }`,
    `function rob(nums) { return nums.reduce((s, n) => s + n, 0); }`,
    `function rob(nums) { return Math.max(...nums); }`,
    `function rob(nums) {
      let a = 0, b = 0;
      for (let i = 0; i < nums.length - 1; i++) [a, b] = [b, Math.max(b, a + nums[i])];
      return b;
    }`,
  ],
  'house-robber-ii': [
    // Treating the circle as a line.
    `function robCircular(nums) {
      let a = 0, b = 0;
      for (const n of nums) [a, b] = [b, Math.max(b, a + n)];
      return b;
    }`,
    // Always excluding the last, or always excluding the first.
    `function robCircular(nums) {
      if (nums.length === 1) return nums[0];
      let a = 0, b = 0;
      for (let i = 0; i < nums.length - 1; i++) [a, b] = [b, Math.max(b, a + nums[i])];
      return b;
    }`,
    `function robCircular(nums) {
      if (nums.length === 1) return nums[0];
      let a = 0, b = 0;
      for (let i = 1; i < nums.length; i++) [a, b] = [b, Math.max(b, a + nums[i])];
      return b;
    }`,
    // Missing the one-house exception.
    `function robCircular(nums) {
      function range(start, end) {
        let a = 0, b = 0;
        for (let i = start; i < end; i++) [a, b] = [b, Math.max(b, a + nums[i])];
        return b;
      }
      return Math.max(range(0, nums.length - 1), range(1, nums.length));
    }`,
  ],
  'coin-change': [
    // Greedy denominations.
    `function coinChange(coins, amount) {
      let count = 0;
      for (const coin of [...coins].sort((a, b) => b - a)) {
        count += Math.floor(amount / coin);
        amount %= coin;
      }
      return amount === 0 ? count : -1;
    }`,
    // Descending sums incorrectly limit every coin to one use.
    `function coinChange(coins, amount) {
      const dp = Array(amount + 1).fill(Infinity); dp[0] = 0;
      for (const coin of coins) {
        for (let s = amount; s >= coin; s--) dp[s] = Math.min(dp[s], dp[s - coin] + 1);
      }
      return Number.isFinite(dp[amount]) ? dp[amount] : -1;
    }`,
    // Zero-initialized minimum states.
    `function coinChange(coins, amount) {
      const dp = Array(amount + 1).fill(0);
      for (let s = 1; s <= amount; s++) {
        for (const coin of coins) if (coin <= s) dp[s] = Math.min(dp[s], dp[s - coin] + 1);
      }
      return dp[amount];
    }`,
    // Confusing "impossible" with a zero answer.
    `function coinChange(coins, amount) {
      const dp = Array(amount + 1).fill(Infinity); dp[0] = 0;
      for (let s = 1; s <= amount; s++) {
        for (const coin of coins) if (coin <= s) dp[s] = Math.min(dp[s], dp[s - coin] + 1);
      }
      return Number.isFinite(dp[amount]) ? dp[amount] : 0;
    }`,
  ],
  'coin-change-ii': [
    // Permutations; saturate this deliberately wrong counter to keep the mutant finite.
    `function change(amount, coins) {
      const dp = Array(amount + 1).fill(0); dp[0] = 1;
      for (let s = 1; s <= amount; s++) {
        for (const c of coins) if (c <= s) dp[s] = Math.min(Number.MAX_SAFE_INTEGER, dp[s] + dp[s - c]);
      }
      return dp[amount];
    }`,
    // Missing the empty combination.
    `function change(amount, coins) {
      const dp = Array(amount + 1).fill(0);
      for (const c of coins) for (let s = c; s <= amount; s++) dp[s] += dp[s - c];
      return dp[amount];
    }`,
    // 0/1 knapsack, not unlimited coins.
    `function change(amount, coins) {
      const dp = Array(amount + 1).fill(0); dp[0] = 1;
      for (const c of coins) for (let s = amount; s >= c; s--) dp[s] += dp[s - c];
      return dp[amount];
    }`,
    // Returning the minimum number instead of the number of combinations.
    `function change(amount, coins) {
      const dp = Array(amount + 1).fill(Infinity); dp[0] = 0;
      for (let s = 1; s <= amount; s++) {
        for (const c of coins) if (c <= s) dp[s] = Math.min(dp[s], dp[s - c] + 1);
      }
      return Number.isFinite(dp[amount]) ? dp[amount] : 0;
    }`,
  ],
  'longest-increasing-subsequence': [
    // Non-decreasing instead of strictly increasing.
    `function lengthOfLIS(nums) {
      const dp = Array(nums.length).fill(1);
      for (let i = 0; i < nums.length; i++) {
        for (let j = 0; j < i; j++) if (nums[j] <= nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
      }
      return Math.max(...dp);
    }`,
    // Longest contiguous run.
    `function lengthOfLIS(nums) {
      let best = 1, run = 1;
      for (let i = 1; i < nums.length; i++) {
        run = nums[i] > nums[i - 1] ? run + 1 : 1;
        best = Math.max(best, run);
      }
      return best;
    }`,
    // Only the subsequence ending at the last element.
    `function lengthOfLIS(nums) {
      const dp = Array(nums.length).fill(1);
      for (let i = 0; i < nums.length; i++) {
        for (let j = 0; j < i; j++) if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
      }
      return dp[nums.length - 1];
    }`,
    // Sorting destroys the original order.
    `function lengthOfLIS(nums) { return new Set(nums.sort((a, b) => a - b)).size; }`,
  ],
  'unique-paths': [
    `function uniquePaths(m, n) { return m * n; }`,
    `function uniquePaths(m, n) {
      const dp = Array.from({ length: m }, () => Array(n).fill(0));
      dp[0][0] = 1;
      for (let r = 1; r < m; r++) for (let c = 1; c < n; c++) dp[r][c] = dp[r - 1][c] + dp[r][c - 1];
      return dp[m - 1][n - 1];
    }`,
    // Maximum rather than the number of alternatives.
    `function uniquePaths(m, n) {
      const row = Array(n).fill(1);
      for (let r = 1; r < m; r++) for (let c = 1; c < n; c++) row[c] = Math.max(row[c], row[c - 1]);
      return row[n - 1];
    }`,
    // Right-to-left updates use the previous row on both sides.
    `function uniquePaths(m, n) {
      const row = Array(n).fill(1);
      for (let r = 1; r < m; r++) for (let c = n - 1; c > 0; c--) row[c] += row[c - 1];
      return row[n - 1];
    }`,
  ],
  'unique-paths-ii': [
    // Ignoring obstacles.
    `function uniquePathsWithObstacles(grid) {
      const row = Array(grid[0].length).fill(1);
      for (let r = 1; r < grid.length; r++) for (let c = 1; c < row.length; c++) row[c] += row[c - 1];
      return row[row.length - 1];
    }`,
    // Skipping an obstacle leaves stale counts.
    `function uniquePathsWithObstacles(grid) {
      const row = Array(grid[0].length).fill(0); row[0] = 1;
      for (const cells of grid) {
        for (let c = 0; c < row.length; c++) {
          if (cells[c] === 1) continue;
          if (c > 0) row[c] += row[c - 1];
        }
      }
      return row[row.length - 1];
    }`,
    // Treating the whole boundary as reachable after obstacles.
    `function uniquePathsWithObstacles(grid) {
      const dp = Array.from({ length: grid.length }, () => Array(grid[0].length).fill(0));
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[0].length; c++) {
          if (grid[r][c]) continue;
          dp[r][c] = r === 0 || c === 0 ? 1 : dp[r - 1][c] + dp[r][c - 1];
        }
      }
      return dp[grid.length - 1][grid[0].length - 1];
    }`,
    // Correct scalar answer, but forbidden input mutation.
    `function uniquePathsWithObstacles(grid) {
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[0].length; c++) {
          grid[r][c] = grid[r][c] ? 0 : r === 0 && c === 0 ? 1
            : (r > 0 ? grid[r - 1][c] : 0) + (c > 0 ? grid[r][c - 1] : 0);
        }
      }
      return grid[grid.length - 1][grid[0].length - 1];
    }`,
  ],
};
