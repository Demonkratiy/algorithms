// Trusted programs for tests only; never import into learner-facing code.
export const counterPrefixSolutions: Record<string, string> = {
  'first-unique-char': `function firstUniqChar(s) {
    const counts = new Map();
    for (const ch of s) counts.set(ch, (counts.get(ch) || 0) + 1);
    for (let i = 0; i < s.length; i++) if (counts.get(s[i]) === 1) return i;
    return -1;
  }`,
  'valid-anagram': `function isAnagram(s, t) {
    if (s.length !== t.length) return false;
    const counts = new Map();
    for (const ch of s) counts.set(ch, (counts.get(ch) || 0) + 1);
    for (const ch of t) {
      if (!counts.get(ch)) return false;
      counts.set(ch, counts.get(ch) - 1);
    }
    return true;
  }`,
  'group-anagrams': `function groupAnagrams(strs) {
    const groups = new Map();
    for (const word of strs) {
      const counts = Array(26).fill(0);
      for (const ch of word) counts[ch.charCodeAt(0) - 97]++;
      const key = counts.join(',');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(word);
    }
    return [...groups.values()];
  }`,
  'top-k-frequent': `function topKFrequent(nums, k) {
    const counts = new Map();
    for (const value of nums) counts.set(value, (counts.get(value) || 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1]).slice(0, k).map(([value]) => value);
  }`,
  'subarray-sum-k': `function subarraySum(nums, k) {
    const counts = new Map([[0, 1]]);
    let sum = 0, answer = 0;
    for (const value of nums) {
      sum += value;
      answer += counts.get(sum - k) || 0;
      counts.set(sum, (counts.get(sum) || 0) + 1);
    }
    return answer;
  }`,
  'pivot-index': `function pivotIndex(nums) {
    const total = nums.reduce((a, b) => a + b, 0);
    let left = 0;
    for (let i = 0; i < nums.length; i++) {
      if (left === total - left - nums[i]) return i;
      left += nums[i];
    }
    return -1;
  }`,
  'product-except-self': `function productExceptSelf(nums) {
    const answer = Array(nums.length).fill(1);
    let left = 1, right = 1;
    for (let i = 0; i < nums.length; i++) {
      answer[i] = left;
      left *= nums[i];
    }
    for (let i = nums.length - 1; i >= 0; i--) {
      answer[i] *= right;
      right *= nums[i];
    }
    return answer;
  }`,
  'subarray-sums-divisible-by-k': `function subarraysDivByK(nums, k) {
    const counts = new Map([[0, 1]]);
    let sum = 0, answer = 0;
    for (const value of nums) {
      sum += value;
      const remainder = ((sum % k) + k) % k;
      answer += counts.get(remainder) || 0;
      counts.set(remainder, (counts.get(remainder) || 0) + 1);
    }
    return answer;
  }`,
}

export const counterPrefixWrongSolutions: Record<string, string[]> = {
  'first-unique-char': [
    `function firstUniqChar(s) {
      for (let i = 0; i < s.length; i++) if (s.indexOf(s[i]) === i) return i;
      return -1;
    }`,
    `function firstUniqChar(s) {
      for (let i = s.length - 1; i >= 0; i--) if (s.indexOf(s[i]) === s.lastIndexOf(s[i])) return i;
      return -1;
    }`,
  ],
  'valid-anagram': [
    `function isAnagram(s, t) { return [...new Set(s)].sort().join('') === [...new Set(t)].sort().join(''); }`,
    `function isAnagram(s, t) {
      const sum = word => [...word].reduce((n, ch) => n + ch.charCodeAt(0), 0);
      return s.length === t.length && sum(s) === sum(t);
    }`,
  ],
  'group-anagrams': [
    `function groupAnagrams(strs) {
      const groups = new Map();
      for (const word of strs) {
        const counts = Array(26).fill(0);
        for (const ch of word) counts[ch.charCodeAt(0) - 97]++;
        const key = counts.join('');
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(word);
      }
      return [...groups.values()];
    }`,
    `function groupAnagrams(strs) {
      const groups = new Map();
      for (const word of strs) {
        const key = [...word].sort().join('');
        if (!groups.has(key)) groups.set(key, new Set());
        groups.get(key).add(word);
      }
      return [...groups.values()].map(group => [...group]);
    }`,
    `function groupAnagrams(strs) { return [strs]; }`,
  ],
  'top-k-frequent': [
    `function topKFrequent(nums, k) { return [...new Set(nums)].sort((a, b) => b - a).slice(0, k); }`,
    `function topKFrequent(nums, k) {
      const counts = new Map();
      for (const value of nums) counts.set(value, (counts.get(value) || 0) + 1);
      return [...counts].sort((a, b) => a[1] - b[1]).slice(0, k).map(([value]) => value);
    }`,
  ],
  'subarray-sum-k': [
    `function subarraySum(nums, k) {
      const counts = new Map();
      let sum = 0, answer = 0;
      for (const value of nums) {
        sum += value;
        answer += counts.get(sum - k) || 0;
        counts.set(sum, (counts.get(sum) || 0) + 1);
      }
      return answer;
    }`,
    `function subarraySum(nums, k) {
      const seen = new Set([0]);
      let sum = 0, answer = 0;
      for (const value of nums) { sum += value; if (seen.has(sum - k)) answer++; seen.add(sum); }
      return answer;
    }`,
    `function subarraySum(nums, k) {
      const counts = new Map([[0, 1]]);
      let sum = 0, answer = 0;
      for (const value of nums) {
        sum += value;
        counts.set(sum, (counts.get(sum) || 0) + 1);
        answer += counts.get(sum - k) || 0;
      }
      return answer;
    }`,
  ],
  'pivot-index': [
    `function pivotIndex(nums) {
      let answer = -1;
      for (let i = 0; i < nums.length; i++)
        if (nums.slice(0, i).reduce((a,b) => a+b, 0) === nums.slice(i+1).reduce((a,b) => a+b, 0)) answer = i;
      return answer;
    }`,
    `function pivotIndex(nums) {
      const total = nums.reduce((a,b) => a+b, 0);
      let left = 0;
      for (let i = 0; i < nums.length; i++) {
        left += nums[i];
        if (left === total - left - nums[i]) return i;
      }
      return -1;
    }`,
  ],
  'product-except-self': [
    `function productExceptSelf(nums) { const total = nums.reduce((a,b) => a*b, 1); return nums.map(n => total / n); }`,
    `function productExceptSelf(nums) {
      const answer = Array(nums.length).fill(1);
      let left = 1, right = 1;
      for (let i = 0; i < nums.length; i++) { answer[i] = left; left *= nums[i]; }
      for (let i = nums.length - 1; i > 0; i--) { answer[i] *= right; right *= nums[i]; }
      return answer;
    }`,
  ],
  'subarray-sums-divisible-by-k': [
    `function subarraysDivByK(nums, k) {
      const counts = new Map([[0, 1]]);
      let sum = 0, answer = 0;
      for (const value of nums) {
        sum += value;
        const remainder = sum % k;
        answer += counts.get(remainder) || 0;
        counts.set(remainder, (counts.get(remainder) || 0) + 1);
      }
      return answer;
    }`,
    `function subarraysDivByK(nums, k) {
      const counts = new Map();
      let sum = 0, answer = 0;
      for (const value of nums) {
        sum += value;
        const remainder = ((sum % k) + k) % k;
        answer += counts.get(remainder) || 0;
        counts.set(remainder, (counts.get(remainder) || 0) + 1);
      }
      return answer;
    }`,
  ],
}
