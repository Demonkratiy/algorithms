// Trusted test-only programs. Never import fixtures into the application task registry.
const debounce = `
function debounce(fn, delay, immediate = false) {
  let timer = null;
  function wrapped(...args) {
    const leading = immediate && timer === null;
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (!immediate) fn.apply(this, args);
    }, delay);
    if (leading) fn.apply(this, args);
  }
  wrapped.cancel = () => { clearTimeout(timer); timer = null; };
  return wrapped;
}`;

const throttle = `
function throttle(fn, interval) {
  let last = -Infinity;
  return function (...args) {
    const now = Date.now();
    if (now - last < interval) return;
    last = now;
    fn.apply(this, args);
  };
}`;

const throttleTrailing = `
function throttleTrailing(fn, interval) {
  let timer = null, pending = null;
  function expire() {
    timer = null;
    if (pending) {
      const { receiver, args } = pending;
      pending = null;
      timer = setTimeout(expire, interval);
      fn.apply(receiver, args);
    }
  }
  return function (...args) {
    if (timer !== null) {
      pending = { receiver: this, args };
      return;
    }
    timer = setTimeout(expire, interval);
    fn.apply(this, args);
  };
}`;

const curry = `
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args);
    return function (...next) {
      return curried.apply(this, [...args, ...next]);
    };
  };
}`;

const memoize = `
function memoize(fn, keyResolver = (...args) => JSON.stringify(args)) {
  const cache = new Map();
  return function (...args) {
    const key = keyResolver(...args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}`;

const deepClone = `
function deepClone(value, seen = new Map()) {
  if (value === null || typeof value !== 'object') return value;
  if (seen.has(value)) return seen.get(value);
  let copy;
  if (value instanceof Date) copy = new Date(value.getTime());
  else if (value instanceof RegExp) copy = new RegExp(value.source, value.flags);
  else if (value instanceof Map) copy = new Map();
  else if (value instanceof Set) copy = new Set();
  else copy = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value));
  seen.set(value, copy);
  if (value instanceof Map) {
    for (const [key, item] of value) copy.set(deepClone(key, seen), deepClone(item, seen));
  } else if (value instanceof Set) {
    for (const item of value) copy.add(deepClone(item, seen));
  } else if (!(value instanceof Date) && !(value instanceof RegExp)) {
    for (const key of Reflect.ownKeys(value)) copy[key] = deepClone(value[key], seen);
  }
  return copy;
}`;

const eventEmitter = `
class EventEmitter {
  constructor() { this.listeners = new Map(); }
  on(event, handler) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }
  off(event, handler) {
    const handlers = this.listeners.get(event);
    if (!handlers) return false;
    let removed = false;
    for (const h of handlers) {
      if (h === handler || h.original === handler) {
        handlers.delete(h); removed = true; break;
      }
    }
    if (!handlers.size) this.listeners.delete(event);
    return removed;
  }
  once(event, handler) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      handler(...args);
    };
    wrapper.original = handler;
    return this.on(event, wrapper);
  }
  emit(event, ...args) {
    const handlers = this.listeners.get(event);
    if (!handlers || !handlers.size) return false;
    for (const handler of [...handlers]) handler(...args);
    return true;
  }
}`;

export const jsUtilsObjectSolutions: Record<string, string> = {
  debounce,
  throttle,
  'throttle-trailing': throttleTrailing,
  curry,
  memoize,
  'deep-clone': deepClone,
  'event-emitter': eventEmitter,
};

export const jsUtilsObjectWrongSolutions: Record<string, string[]> = {
  debounce: [
    debounce.replace('clearTimeout(timer);', ''),
    debounce.replace('const leading = immediate && timer === null;', 'const leading = false;'),
    debounce.replaceAll('fn.apply(this, args)', 'fn(...args)'),
    debounce.replace('clearTimeout(timer); timer = null;', 'timer = null;'),
  ],
  throttle: [
    throttle.replace('now - last < interval', 'now - last <= interval'),
    throttle.replace('fn.apply(this, args)', 'fn(...args)'),
    throttleTrailing.replace('function throttleTrailing(', 'function throttle('),
  ],
  'throttle-trailing': [
    throttle.replace('function throttle(', 'function throttleTrailing('),
    throttleTrailing.replace('pending = { receiver: this, args };', 'pending ??= { receiver: this, args };'),
    throttleTrailing.replace('fn.apply(receiver, args)', 'fn(...args)'),
    throttleTrailing.replace('timer = setTimeout(expire, interval);', ''),
  ],
  curry: [
    curry.replace('args.length >= fn.length', 'args.length === fn.length'),
    curry.replace('return curried.apply(this, [...args, ...next]);', 'args.push(...next); return curried.apply(this, args);'),
    curry.replace('fn.apply(this, args)', 'fn(...args)'),
    curry.replace('return function (...next) {', 'return (...next) => {'),
  ],
  memoize: [
    memoize.replace('cache.has(key)', 'cache.get(key)'),
    memoize.replace('JSON.stringify(args)', "args.join(',')"),
    memoize.replace('const key = keyResolver(...args);', 'const key = JSON.stringify(args);'),
    memoize.replace('fn.apply(this, args)', 'fn(...args)'),
  ],
  'deep-clone': [
    'function deepClone(value) { return value; }',
    'function deepClone(value) { return JSON.parse(JSON.stringify(value)); }',
    deepClone.replace('Reflect.ownKeys(value)', 'Object.keys(value)'),
    deepClone.replace('Object.create(Object.getPrototypeOf(value))', '{}'),
    deepClone.replace('seen.set(value, copy);', "if (!(value instanceof Date) && !(value instanceof RegExp)) seen.set(value, copy);"),
  ],
  'event-emitter': [
    eventEmitter.replace('of [...handlers]', 'of handlers'),
    eventEmitter.replace('this.off(event, wrapper);\n      handler(...args);', 'handler(...args);\n      this.off(event, wrapper);'),
    eventEmitter.replace('h === handler || h.original === handler', 'h === handler'),
    eventEmitter.replace('for (const handler of [...handlers]) handler(...args);', 'for (const handler of [...handlers]) { try { handler(...args); } catch {} }'),
    eventEmitter.replace('for (const handler of [...handlers]) handler(...args);', 'for (const handler of [...handlers]) handler.apply(this, args);'),
  ],
};
