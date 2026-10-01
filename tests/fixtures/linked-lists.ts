// Trusted programs for tests only; never import into learner-facing code.
export const linkedListSolutions: Record<string, string> = {
  'reverse-linked-list': `function reverseList(head) {
    let previous = null;
    while (head !== null) {
      const next = head.next;
      head.next = previous;
      previous = head;
      head = next;
    }
    return previous;
  }`,
  'middle-of-list': `function middleNode(head) {
    let slow = head, fast = head;
    while (fast !== null && fast.next !== null) {
      slow = slow.next;
      fast = fast.next.next;
    }
    return slow;
  }`,
  'linked-list-cycle': `function hasCycle(head) {
    let slow = head, fast = head;
    while (fast !== null && fast.next !== null) {
      slow = slow.next;
      fast = fast.next.next;
      if (slow === fast) return true;
    }
    return false;
  }`,
  'linked-list-cycle-entry': `function detectCycle(head) {
    let slow = head, fast = head;
    while (fast !== null && fast.next !== null) {
      slow = slow.next;
      fast = fast.next.next;
      if (slow === fast) {
        let entry = head;
        while (entry !== slow) {
          entry = entry.next;
          slow = slow.next;
        }
        return entry;
      }
    }
    return null;
  }`,
  'merge-two-sorted-lists': `function mergeTwoLists(list1, list2) {
    const dummy = new ListNode();
    let tail = dummy;
    while (list1 !== null && list2 !== null) {
      if (list1.val <= list2.val) {
        tail.next = list1;
        list1 = list1.next;
      } else {
        tail.next = list2;
        list2 = list2.next;
      }
      tail = tail.next;
    }
    tail.next = list1 !== null ? list1 : list2;
    return dummy.next;
  }`,
  'remove-nth-from-end': `function removeNthFromEnd(head, n) {
    const dummy = new ListNode(0, head);
    let slow = dummy, fast = dummy;
    for (let i = 0; i <= n; i++) fast = fast.next;
    while (fast !== null) {
      fast = fast.next;
      slow = slow.next;
    }
    slow.next = slow.next.next;
    return dummy.next;
  }`,
  'palindrome-linked-list': `function isPalindrome(head) {
    let slow = head, fast = head;
    while (fast.next !== null && fast.next.next !== null) {
      slow = slow.next;
      fast = fast.next.next;
    }
    let previous = null, current = slow.next;
    while (current !== null) {
      const next = current.next;
      current.next = previous;
      previous = current;
      current = next;
    }
    let first = head, second = previous;
    while (second !== null) {
      if (first.val !== second.val) return false;
      first = first.next;
      second = second.next;
    }
    return true;
  }`,
};

export const linkedListWrongSolutions: Record<string, string[]> = {
  'reverse-linked-list': [
    `function reverseList(head) { return head; }`,
    `function reverseList(head) {
      let previous = null;
      while (head !== null) {
        previous = new ListNode(head.val, previous);
        head = head.next;
      }
      return previous;
    }`,
    `function reverseList(head) {
      let previous = null;
      while (head !== null && head.next !== null) {
        const next = head.next;
        head.next = previous;
        previous = head;
        head = next;
      }
      return previous;
    }`,
    `function reverseList(head) {
      if (head !== null) head.next = head;
      return head;
    }`,
  ],
  'middle-of-list': [
    `function middleNode(head) {
      let slow = head, fast = head.next;
      while (fast !== null && fast.next !== null) {
        slow = slow.next;
        fast = fast.next.next;
      }
      return slow;
    }`,
    `${linkedListSolutions['middle-of-list'].replace('return slow;', 'return slow.val;')}`,
    `${linkedListSolutions['middle-of-list'].replace('return slow;', 'return new ListNode(slow.val, slow.next);')}`,
    `function middleNode(head) {
      let slow = head, fast = head;
      while (fast.next !== null) {
        slow = slow.next;
        fast = fast.next.next;
      }
      return slow;
    }`,
  ],
  'linked-list-cycle': [
    `${linkedListSolutions['linked-list-cycle']}
    function hasCycle(head) {
      const values = new Set();
      while (head !== null) {
        if (values.has(head.val)) return true;
        values.add(head.val);
        head = head.next;
      }
      return false;
    }`,
    `${linkedListSolutions['linked-list-cycle']}
    function hasCycle(head) { return head !== null; }`,
  ],
  'linked-list-cycle-entry': [
    linkedListSolutions['linked-list-cycle-entry'].replace('return entry;', 'return new ListNode(entry.val, entry.next);'),
    `${linkedListSolutions['linked-list-cycle-entry']}
    function detectCycle(head) {
      let slow = head, fast = head;
      while (fast !== null && fast.next !== null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow === fast) return slow;
      }
      return null;
    }`,
    `${linkedListSolutions['linked-list-cycle-entry']}
    function detectCycle(head) {
      const values = new Set();
      while (head !== null) {
        if (values.has(head.val)) return head;
        values.add(head.val);
        head = head.next;
      }
      return null;
    }`,
  ],
  'merge-two-sorted-lists': [
    `function mergeTwoLists(list1, list2) {
      const values = [];
      for (let p = list1; p !== null; p = p.next) values.push(p.val);
      for (let p = list2; p !== null; p = p.next) values.push(p.val);
      values.sort((a, b) => a - b);
      let head = null;
      for (let i = values.length - 1; i >= 0; i--) head = new ListNode(values[i], head);
      return head;
    }`,
    linkedListSolutions['merge-two-sorted-lists'].replace('tail.next = list1 !== null ? list1 : list2;', 'tail.next = null;'),
    linkedListSolutions['merge-two-sorted-lists'].replace('return dummy.next;', 'return dummy;'),
    `function mergeTwoLists(list1, list2) {
      if (list1 === null) return list2;
      let tail = list1;
      while (tail.next !== null) tail = tail.next;
      tail.next = list2;
      return list1;
    }`,
  ],
  'remove-nth-from-end': [
    linkedListSolutions['remove-nth-from-end'].replace('return dummy.next;', 'return head;'),
    linkedListSolutions['remove-nth-from-end'].replace('i <= n', 'i < n'),
    `function removeNthFromEnd(head, n) {
      const nodes = [];
      for (let p = head; p !== null; p = p.next) nodes.push(p);
      nodes.splice(n - 1, 1);
      for (let i = 0; i < nodes.length; i++) nodes[i].next = nodes[i + 1] || null;
      return nodes[0] || null;
    }`,
    `function removeNthFromEnd(head, n) {
      const values = [];
      for (let p = head; p !== null; p = p.next) values.push(p.val);
      values.splice(values.length - n, 1);
      let result = null;
      for (let i = values.length - 1; i >= 0; i--) result = new ListNode(values[i], result);
      return result;
    }`,
  ],
  'palindrome-linked-list': [
    `function isPalindrome(head) { return true; }`,
    `function isPalindrome(head) {
      let tail = head;
      while (tail.next !== null) tail = tail.next;
      return head.val === tail.val;
    }`,
    `function isPalindrome(head) {
      const values = [];
      for (let p = head; p !== null; p = p.next) values.push(p.val);
      if (values.length % 2 !== 0) return false;
      return values.every((value, i) => value === values[values.length - i - 1]);
    }`,
    `function isPalindrome(head) {
      const values = [];
      for (let p = head; p !== null; p = p.next) values.push(p.val);
      return values.every((value, i) => i + 1 >= values.length / 2 || value === values[values.length - i - 1]);
    }`,
  ],
};
