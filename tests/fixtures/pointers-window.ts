// Trusted implementations for automated tests only. Never import into the application.
export const pointersWindowSolutions: Record<string, string> = {
  'valid-palindrome': `function isPalindrome(s) {
    let left = 0, right = s.length - 1;
    while (left < right) {
      if (!/[a-z0-9]/i.test(s[left])) { left++; continue; }
      if (!/[a-z0-9]/i.test(s[right])) { right--; continue; }
      if (s[left].toLowerCase() !== s[right].toLowerCase()) return false;
      left++; right--;
    }
    return true;
  }`,
  'move-zeroes': `function moveZeroes(nums) {
    let write = 0;
    for (let read = 0; read < nums.length; read++) {
      if (nums[read] !== 0) nums[write++] = nums[read];
    }
    while (write < nums.length) nums[write++] = 0;
  }`,
  'merge-sorted-arrays': `function mergeSorted(a, b) {
    const result = [];
    let i = 0, j = 0;
    while (i < a.length && j < b.length) {
      if (a[i] <= b[j]) result.push(a[i++]);
      else result.push(b[j++]);
    }
    while (i < a.length) result.push(a[i++]);
    while (j < b.length) result.push(b[j++]);
    return result;
  }`,
  'min-subarray-sum': `function minSubArrayLen(target, nums) {
    let left = 0, sum = 0, best = Infinity;
    for (let right = 0; right < nums.length; right++) {
      sum += nums[right];
      while (sum >= target) {
        best = Math.min(best, right - left + 1);
        sum -= nums[left++];
      }
    }
    return best === Infinity ? 0 : best;
  }`,
  'max-vowels': `function maxVowels(s, k) {
    const vowels = new Set(['a', 'e', 'i', 'o', 'u']);
    let count = 0, best = 0;
    for (let right = 0; right < s.length; right++) {
      if (vowels.has(s[right])) count++;
      if (right >= k && vowels.has(s[right - k])) count--;
      if (right >= k - 1) best = Math.max(best, count);
    }
    return best;
  }`,
  'longest-substring': `function lengthOfLongestSubstring(s) {
    const last = new Map();
    let left = 0, best = 0;
    for (let right = 0; right < s.length; right++) {
      if (last.has(s[right])) left = Math.max(left, last.get(s[right]) + 1);
      last.set(s[right], right);
      best = Math.max(best, right - left + 1);
    }
    return best;
  }`,
};

export const pointersWindowWrongSolutions: Record<string, string> = {
  'valid-palindrome': `function isPalindrome(s) {
    const letters = s.toLowerCase().replace(/[^a-z]/g, '');
    return letters === letters.split('').reverse().join('');
  }`,
  'move-zeroes': `function moveZeroes(nums) {
    return nums.filter(value => value !== 0).concat(nums.filter(value => value === 0));
  }`,
  'merge-sorted-arrays': `function mergeSorted(a, b) {
    let i = 0, j = 0;
    const result = [];
    while (i < a.length && j < b.length) {
      result.push(a[i] <= b[j] ? a[i++] : b[j++]);
    }
    return result;
  }`,
  'min-subarray-sum': `function minSubArrayLen(target, nums) {
    let left = 0, sum = 0, best = Infinity;
    for (let right = 0; right < nums.length; right++) {
      sum += nums[right];
      if (sum >= target) {
        best = Math.min(best, right - left + 1);
        sum -= nums[left++];
      }
    }
    return best === Infinity ? 0 : best;
  }`,
  'max-vowels': `function maxVowels(s, k) {
    const vowel = ch => 'aeiou'.includes(ch);
    let count = 0;
    for (let i = 0; i < k; i++) if (vowel(s[i])) count++;
    let best = count;
    for (let right = k; right < s.length - 1; right++) {
      if (vowel(s[right])) count++;
      if (vowel(s[right - k])) count--;
      best = Math.max(best, count);
    }
    return best;
  }`,
  'longest-substring': `function lengthOfLongestSubstring(s) {
    const last = new Map();
    let left = 0, best = 0;
    for (let right = 0; right < s.length; right++) {
      if (last.has(s[right])) left = last.get(s[right]) + 1;
      last.set(s[right], right);
      best = Math.max(best, right - left + 1);
    }
    return best;
  }`,
};
