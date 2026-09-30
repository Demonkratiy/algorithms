// Trusted test-only source; never import into the registry or application.
export const greedySolutions: Record<string, string> = {
  'best-time-to-buy-sell-stock': `function maxProfit(prices) {
    let low = prices[0], profit = 0;
    for (let i = 1; i < prices.length; i++) {
      profit = Math.max(profit, prices[i] - low);
      low = Math.min(low, prices[i]);
    }
    return profit;
  }`,
  'stock-ii': `function maxProfitMultiple(prices) {
    let profit = 0;
    for (let i = 1; i < prices.length; i++) {
      profit += Math.max(0, prices[i] - prices[i - 1]);
    }
    return profit;
  }`,
  'jump-game': `function canJump(nums) {
    let reach = 0;
    for (let i = 0; i < nums.length; i++) {
      if (i > reach) return false;
      reach = Math.max(reach, i + nums[i]);
    }
    return true;
  }`,
  'jump-game-ii': `function jump(nums) {
    let end = 0, reach = 0, jumps = 0;
    for (let i = 0; i < nums.length - 1; i++) {
      reach = Math.max(reach, i + nums[i]);
      if (i === end) { jumps++; end = reach; }
    }
    return jumps;
  }`,
  'non-overlapping-intervals': `function eraseOverlapIntervals(intervals) {
    intervals.sort((a, b) => a[1] - b[1]);
    let end = -Infinity, kept = 0;
    for (const [start, finish] of intervals) {
      if (start >= end) { kept++; end = finish; }
    }
    return intervals.length - kept;
  }`,
};

// All variants use bounded loops or throw; none rely on timeouts to terminate.
export const greedyWrongSolutions: Record<string, string[]> = {
  'best-time-to-buy-sell-stock': [
    `function maxProfit(prices) { return Math.max(...prices) - Math.min(...prices); }`,
    greedySolutions['stock-ii'].replace('maxProfitMultiple', 'maxProfit'),
    greedySolutions['best-time-to-buy-sell-stock'].replace('profit = 0', 'profit = -Infinity'),
    greedySolutions['best-time-to-buy-sell-stock'].replace('i < prices.length', 'i < prices.length - 1'),
  ],
  'stock-ii': [
    greedySolutions['best-time-to-buy-sell-stock'].replace('maxProfit(', 'maxProfitMultiple('),
    `function maxProfitMultiple(prices) { return prices[prices.length - 1] - prices[0]; }`,
    greedySolutions['stock-ii'].replace('Math.max(0, prices[i] - prices[i - 1])', 'Math.abs(prices[i] - prices[i - 1])'),
    greedySolutions['stock-ii'].replace('i < prices.length', 'i < prices.length - 1'),
  ],
  'jump-game': [
    greedySolutions['jump-game'].replace('if (i > reach) return false;', ''),
    `function canJump(nums) { return !nums.includes(0); }`,
    greedySolutions['jump-game'].replace('i > reach', 'i >= reach'),
    `function canJump(nums) {
      let position = 0;
      for (let tries = 0; tries < nums.length && position < nums.length - 1; tries++) {
        if (nums[position] === 0) return false;
        position += nums[position];
      }
      return position >= nums.length - 1;
    }`,
    `function canJump(nums) { return 1; }`,
  ],
  'jump-game-ii': [
    greedySolutions['jump-game-ii'].replace('i < nums.length - 1', 'i < nums.length'),
    `function jump(nums) { return nums.length - 1; }`,
    `function jump(nums) {
      let position = 0;
      for (let jumps = 0; jumps <= nums.length; jumps++) {
        if (position >= nums.length - 1) return jumps;
        if (nums[position] === 0) throw new Error('Dead end');
        position += nums[position];
      }
      throw new Error('Step limit');
    }`,
    greedySolutions['jump-game-ii'].replace('reach = Math.max(reach, i + nums[i]);', 'reach = Math.max(reach, nums[i]);'),
    greedySolutions['jump-game'].replace('canJump', 'jump'),
  ],
  'non-overlapping-intervals': [
    greedySolutions['non-overlapping-intervals'].replace('a[1] - b[1]', 'a[0] - b[0]'),
    greedySolutions['non-overlapping-intervals'].replace('start >= end', 'start > end'),
    greedySolutions['non-overlapping-intervals'].replace('return intervals.length - kept;', 'return kept;'),
    greedySolutions['non-overlapping-intervals'].replace('end = -Infinity', 'end = 0'),
    greedySolutions['non-overlapping-intervals'].replace('.sort((a, b) => a[1] - b[1])', '.sort()'),
  ],
};
