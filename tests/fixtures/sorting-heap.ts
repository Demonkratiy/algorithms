// Trusted implementations for tests only; never included in task starters.
const minHeap = `class MinHeap {
  constructor(compare = (a, b) => a - b) { this.items = []; this.compare = compare; }
  get size() { return this.items.length; }
  peek() { return this.items[0]; }
  push(value) {
    this.items.push(value);
    let i = this.size - 1;
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.compare(this.items[p], this.items[i]) <= 0) break;
      [this.items[p], this.items[i]] = [this.items[i], this.items[p]];
      i = p;
    }
  }
  pop() {
    if (this.size === 0) return undefined;
    const first = this.items[0], last = this.items.pop();
    if (this.size > 0) {
      this.items[0] = last;
      let i = 0;
      while (true) {
        const left = 2 * i + 1, right = left + 1;
        let best = i;
        if (left < this.size && this.compare(this.items[left], this.items[best]) < 0) best = left;
        if (right < this.size && this.compare(this.items[right], this.items[best]) < 0) best = right;
        if (best === i) break;
        [this.items[i], this.items[best]] = [this.items[best], this.items[i]];
        i = best;
      }
    }
    return first;
  }
}`

const heapify = minHeap.replace('  get size()', `  static heapify(array, compare = (a,b) => a-b) {
    const heap = new MinHeap(compare);
    heap.items = [...array];
    for (let root = Math.floor(heap.size / 2) - 1; root >= 0; root--) {
      let i = root;
      while (true) {
        const left = 2*i+1, right = left+1;
        let best = i;
        if (left < heap.size && heap.compare(heap.items[left], heap.items[best]) < 0) best = left;
        if (right < heap.size && heap.compare(heap.items[right], heap.items[best]) < 0) best = right;
        if (best === i) break;
        [heap.items[i], heap.items[best]] = [heap.items[best], heap.items[i]];
        i = best;
      }
    }
    return heap;
  }
  get size()`)

export const sortingHeapSolutions: Record<string, string> = {
  'sort-colors': `function sortColors(nums) {
    let low = 0, mid = 0, high = nums.length - 1;
    while (mid <= high) {
      if (nums[mid] === 0) {
        [nums[low], nums[mid]] = [nums[mid], nums[low]]; low++; mid++;
      } else if (nums[mid] === 1) mid++;
      else { [nums[mid], nums[high]] = [nums[high], nums[mid]]; high--; }
    }
  }`,
  'merge-intervals': `function merge(intervals) {
    const sorted = intervals.map(pair => [...pair]).sort((a, b) => a[0] - b[0]);
    const result = [];
    for (const pair of sorted) {
      const last = result[result.length - 1];
      if (last && pair[0] <= last[1]) last[1] = Math.max(last[1], pair[1]);
      else result.push(pair);
    }
    return result;
  }`,
  'kth-largest': `function findKthLargest(nums, k) { return nums.sort((a,b) => b-a)[k-1]; }`,
  'meeting-rooms': `function canAttendMeetings(intervals) {
    intervals.sort((a,b) => a[0]-b[0]);
    return intervals.every((pair,i) => i === 0 || pair[0] >= intervals[i-1][1]);
  }`,
  'meeting-rooms-ii': `function minMeetingRooms(intervals) {
    const events = intervals.flatMap(([a,b]) => [[a,1],[b,-1]]);
    events.sort((a,b) => a[0]-b[0] || a[1]-b[1]);
    let active = 0, best = 0;
    for (const [,delta] of events) { active += delta; best = Math.max(best, active); }
    return best;
  }`,
  'merge-sort-implementation': `function mergeSort(arr) {
    if (arr.length <= 1) return [...arr];
    const mid = Math.floor(arr.length / 2);
    const a = mergeSort(arr.slice(0,mid)), b = mergeSort(arr.slice(mid));
    const result = [];
    let i = 0, j = 0;
    while (i < a.length && j < b.length) result.push(a[i] <= b[j] ? a[i++] : b[j++]);
    return result.concat(a.slice(i), b.slice(j));
  }`,
  'implement-min-heap': minHeap,
  'heap-comparator': minHeap,
  'heapify': heapify,
  'k-closest-points': `function kClosest(points, k) {
    const distance = ([x,y]) => x*x+y*y;
    return points.sort((a,b) => distance(a)-distance(b)).slice(0,k);
  }`,
}

export const sortingHeapWrongSolutions: Record<string, string[]> = {
  'sort-colors': [
    `function sortColors(nums) { return [...nums].sort((a,b) => a-b); }`,
    sortingHeapSolutions['sort-colors'].replace('mid <= high', 'mid < high'),
    sortingHeapSolutions['sort-colors'].replace('high--;', 'high--; mid++;'),
  ],
  'merge-intervals': [
    sortingHeapSolutions['merge-intervals'].replace('pair[0] <= last[1]', 'pair[0] < last[1]'),
    sortingHeapSolutions['merge-intervals'].replace('Math.max(last[1], pair[1])', 'pair[1]'),
    sortingHeapSolutions['merge-intervals'].replace('.sort((a, b) => a[0] - b[0])', '.sort()'),
  ],
  'kth-largest': [
    `function findKthLargest(nums, k) { return [...new Set(nums)].sort((a,b) => b-a)[k-1]; }`,
    `function findKthLargest(nums, k) { return nums.sort((a,b) => b-a)[k]; }`,
    `function findKthLargest(nums, k) { return nums.sort().reverse()[k-1]; }`,
  ],
  'meeting-rooms': [
    sortingHeapSolutions['meeting-rooms'].replace('pair[0] >= intervals[i-1][1]', 'pair[0] > intervals[i-1][1]'),
    sortingHeapSolutions['meeting-rooms'].replace('intervals.sort((a,b) => a[0]-b[0]);', ''),
    `function canAttendMeetings(intervals) { return intervals.length <= 1; }`,
  ],
  'meeting-rooms-ii': [
    sortingHeapSolutions['meeting-rooms-ii'].replace('a[1]-b[1]', 'b[1]-a[1]'),
    sortingHeapSolutions['meeting-rooms-ii'].replace('return best;', 'return active;'),
    `function minMeetingRooms(intervals) {
      return intervals.reduce((best,[a,b]) => Math.max(best, intervals.filter(([c,d]) => a<d && c<b).length),0);
    }`,
  ],
  'merge-sort-implementation': [
    `function mergeSort(arr) { return arr.sort((a,b) => a-b); }`,
    sortingHeapSolutions['merge-sort-implementation'].replace('return [...arr]', 'return arr'),
    sortingHeapSolutions['merge-sort-implementation'].replace('result.concat(a.slice(i), b.slice(j))', 'result'),
    `function mergeSort(arr) { return [...arr].sort(); }`,
  ],
  'implement-min-heap': [
    minHeap.replace('if (right < this.size', 'if (false && right < this.size'),
    minHeap.replace('if (this.size > 0) {', 'if (true) {'),
    minHeap.replace('if (this.size === 0) return undefined;', 'if (this.size === 0) return null;'),
    minHeap.replace('peek() { return this.items[0]; }', 'peek() { return this.pop(); }'),
    minHeap.replace('get size() { return this.items.length; }', 'size() { return this.items.length; }'),
    minHeap.replace('this.items = [];', 'this.items = MinHeap.shared ??= [];'),
    minHeap.replace('this.items.push(value);', 'if (this.items.includes(value)) return; this.items.push(value);'),
  ],
  'heap-comparator': [
    minHeap.replace('this.compare = compare;', 'this.compare = (a,b) => a-b;'),
    minHeap.replace('if (right < this.size', 'if (false && right < this.size'),
    minHeap.replace('if (this.size > 0) {', 'if (true) {'),
    minHeap.replace('peek() { return this.items[0]; }', 'peek() { return this.items[0] ?? null; }'),
    minHeap.replace('this.compare = compare;', 'MinHeap.sharedCompare = compare;').replaceAll('this.compare(', 'MinHeap.sharedCompare('),
    minHeap.replace('this.items = [];', 'this.items = MinHeap.shared ??= [];'),
  ],
  'heapify': [
    heapify.replace('heap.items = [...array];', 'heap.items = array;'),
    heapify.replace('heap.items = [...array];', 'heap.items = array.sort((a,b) => compare(a,b)).slice();'),
    heapify.replace('root >= 0', 'root > 0'),
    heapify.replace('let i = root;', 'let i = 0;'),
    heapify.replace('new MinHeap(compare)', 'new MinHeap()'),
    heapify.replace('heap.items = [...array];', 'heap.items = [...new Set(array)];'),
    heapify.replace('const heap = new MinHeap(compare);', 'const heap = MinHeap.sharedHeap ??= new MinHeap(compare);'),
    heapify.replace('return heap;', 'return heap.items;'),
  ],
  'k-closest-points': [
    sortingHeapSolutions['k-closest-points'].replace('distance(a)-distance(b)', 'distance(b)-distance(a)'),
    sortingHeapSolutions['k-closest-points'].replace('x*x+y*y', 'Math.abs(x)+Math.abs(y)'),
    sortingHeapSolutions['k-closest-points'].replace('.slice(0,k)', '.slice(0,k).map(([x,y]) => [y,x])'),
    `function kClosest(points,k) {
      const unique = [...new Map(points.map(p => [JSON.stringify(p),p])).values()];
      return unique.sort((a,b) => a[0]**2+a[1]**2-b[0]**2-b[1]**2).slice(0,k);
    }`,
    `function kClosest(points,k) { return Array.from({length:k}, () => points[0]); }`,
  ],
}
