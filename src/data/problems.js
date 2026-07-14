// Coding problems for the Playground.
// Each test is an expression evaluated after the user's code;
// its (awaited) result is compared to `expected` via JSON.stringify.

export const PROBLEMS = [
  {
    id: "reverse-string",
    title: "Reverse a String",
    difficulty: "easy",
    statement: `Write a function reverseString(str) that returns the string reversed.

Do NOT use a loop index if you can — try the split/reverse/join or spread approach.`,
    examples: [
      `reverseString("hello")  // "olleh"`,
      `reverseString("JS")     // "SJ"`,
    ],
    starter: `function reverseString(str) {
  // your code here
}
`,
    tests: [
      { expr: `reverseString("hello")`, expected: "olleh" },
      { expr: `reverseString("a")`, expected: "a" },
      { expr: `reverseString("")`, expected: "" },
      { expr: `reverseString("DevPrep")`, expected: "SJperP" },
    ],
  },
  {
    id: "palindrome",
    title: "Valid Palindrome",
    difficulty: "easy",
    statement: `Write isPalindrome(str) that returns true if str reads the same forwards and backwards.

Ignore case and all non-alphanumeric characters.`,
    examples: [
      `isPalindrome("racecar")                  // true`,
      `isPalindrome("A man, a plan, a canal: Panama") // true`,
      `isPalindrome("hello")                    // false`,
    ],
    starter: `function isPalindrome(str) {
  // tip: clean the string first with replace + toLowerCase
}
`,
    tests: [
      { expr: `isPalindrome("racecar")`, expected: true },
      { expr: `isPalindrome("A man, a plan, a canal: Panama")`, expected: true },
      { expr: `isPalindrome("hello")`, expected: false },
      { expr: `isPalindrome("No 'x' in Nixon")`, expected: true },
    ],
  },
  {
    id: "fizzbuzz",
    title: "FizzBuzz",
    difficulty: "easy",
    statement: `Write fizzBuzz(n) that returns an ARRAY of strings from 1 to n where:
• multiples of 3 → "Fizz"
• multiples of 5 → "Buzz"
• multiples of both → "FizzBuzz"
• otherwise → the number as a string`,
    examples: [`fizzBuzz(5) // ["1","2","Fizz","4","Buzz"]`],
    starter: `function fizzBuzz(n) {
  const result = [];
  // your code here
  return result;
}
`,
    tests: [
      { expr: `fizzBuzz(5)`, expected: ["1", "2", "Fizz", "4", "Buzz"] },
      { expr: `fizzBuzz(15)[14]`, expected: "FizzBuzz" },
      { expr: `fizzBuzz(3)`, expected: ["1", "2", "Fizz"] },
      { expr: `fizzBuzz(1)`, expected: ["1"] },
    ],
  },
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "medium",
    statement: `Write twoSum(nums, target) that returns the INDICES of the two numbers that add up to target.

Assume exactly one solution exists. Can you do it in one pass — O(n) with a Map?`,
    examples: [
      `twoSum([2, 7, 11, 15], 9)  // [0, 1]`,
      `twoSum([3, 2, 4], 6)       // [1, 2]`,
    ],
    starter: `function twoSum(nums, target) {
  // brute force works... but the Map approach gets the offer 😉
}
`,
    tests: [
      { expr: `twoSum([2,7,11,15], 9)`, expected: [0, 1] },
      { expr: `twoSum([3,2,4], 6)`, expected: [1, 2] },
      { expr: `twoSum([3,3], 6)`, expected: [0, 1] },
      { expr: `twoSum([-1,5,10,-8], -9)`, expected: [0, 3] },
    ],
  },
  {
    id: "flatten",
    title: "Deep Flatten an Array",
    difficulty: "medium",
    statement: `Write flattenDeep(arr) that flattens a nested array of ANY depth — without using Array.prototype.flat.

Classic approaches: recursion + reduce, or a stack.`,
    examples: [`flattenDeep([1, [2, [3, [4]], 5]]) // [1,2,3,4,5]`],
    starter: `function flattenDeep(arr) {
  // no arr.flat(Infinity) allowed — build it yourself!
}
`,
    tests: [
      { expr: `flattenDeep([1,[2,[3,[4]],5]])`, expected: [1, 2, 3, 4, 5] },
      { expr: `flattenDeep([])`, expected: [] },
      { expr: `flattenDeep([[[[1]]]])`, expected: [1] },
      { expr: `flattenDeep([1,2,3])`, expected: [1, 2, 3] },
    ],
  },
  {
    id: "chunk",
    title: "Chunk an Array",
    difficulty: "easy",
    statement: `Write chunk(arr, size) that splits an array into groups of the given size. The last chunk may be smaller.`,
    examples: [
      `chunk([1,2,3,4,5], 2) // [[1,2],[3,4],[5]]`,
      `chunk(['a','b','c'], 1) // [['a'],['b'],['c']]`,
    ],
    starter: `function chunk(arr, size) {
  // tip: slice is your friend
}
`,
    tests: [
      { expr: `chunk([1,2,3,4,5], 2)`, expected: [[1, 2], [3, 4], [5]] },
      { expr: `chunk(["a","b","c"], 1)`, expected: [["a"], ["b"], ["c"]] },
      { expr: `chunk([1,2,3], 5)`, expected: [[1, 2, 3]] },
      { expr: `chunk([], 3)`, expected: [] },
    ],
  },
  {
    id: "first-unique",
    title: "First Non-Repeating Character",
    difficulty: "easy",
    statement: `Write firstUnique(str) that returns the first character that appears exactly once, or null if none exists.

Aim for two passes: count frequencies, then find the first with count 1.`,
    examples: [
      `firstUnique("swiss")    // "w"`,
      `firstUnique("aabb")     // null`,
    ],
    starter: `function firstUnique(str) {
  // build a frequency map first
}
`,
    tests: [
      { expr: `firstUnique("swiss")`, expected: "w" },
      { expr: `firstUnique("aabb")`, expected: null },
      { expr: `firstUnique("x")`, expected: "x" },
      { expr: `firstUnique("aabbcdd")`, expected: "c" },
    ],
  },
  {
    id: "group-by",
    title: "Group Objects by Property",
    difficulty: "medium",
    statement: `Write groupByProp(arr, prop) that groups an array of objects by the given property value.

Return an object: { value1: [items...], value2: [items...] }. Perfect use case for reduce.`,
    examples: [
      `groupByProp([{r:"a",n:1},{r:"b",n:2},{r:"a",n:3}], "r")
// { a: [{r:"a",n:1},{r:"a",n:3}], b: [{r:"b",n:2}] }`,
    ],
    starter: `function groupByProp(arr, prop) {
  // reduce into an object of arrays
}
`,
    tests: [
      { expr: `groupByProp([{r:"a",n:1},{r:"b",n:2},{r:"a",n:3}], "r")`, expected: { a: [{ r: "a", n: 1 }, { r: "a", n: 3 }], b: [{ r: "b", n: 2 }] } },
      { expr: `groupByProp([], "x")`, expected: {} },
      { expr: `groupByProp([{t:1},{t:1}], "t")`, expected: { 1: [{ t: 1 }, { t: 1 }] } },
    ],
  },
  {
    id: "deep-clone",
    title: "Deep Clone (no structuredClone)",
    difficulty: "medium",
    statement: `Write deepClone(value) that returns a DEEP copy of any nested object/array — WITHOUT using structuredClone or JSON tricks.

Handle: objects, arrays, and primitive values. Recursion is the classic approach.`,
    examples: [
      `const a = { x: { y: 1 }, list: [1, 2] };
const b = deepClone(a);
b.x.y = 99;
a.x.y // still 1 ✅`,
    ],
    starter: `function deepClone(value) {
  // if primitive → return as-is
  // if array → clone each element
  // if object → clone each key
}
`,
    tests: [
      { expr: `deepClone({x:{y:1}, list:[1,2]})`, expected: { x: { y: 1 }, list: [1, 2] } },
      { expr: `(() => { const a = {x:{y:1}}; const b = deepClone(a); b.x.y = 99; return a.x.y; })()`, expected: 1 },
      { expr: `deepClone([1,[2,[3]]])`, expected: [1, [2, [3]]] },
      { expr: `deepClone(42)`, expected: 42 },
    ],
  },
  {
    id: "curry-sum",
    title: "Curried Sum: sum(1)(2)(3)",
    difficulty: "hard",
    statement: `Write sum(a) so that it can be called as sum(1)(2)(3) — each call takes one number, and calling the result with NO argument returns the total.

sum(1)(2)(3)() → 6. This tests closures + recursion.`,
    examples: [
      `sum(1)(2)(3)()      // 6`,
      `sum(5)()            // 5`,
      `sum(1)(2)(3)(4)()   // 10`,
    ],
    starter: `function sum(a) {
  // return a function that either adds more... or returns the total
}
`,
    tests: [
      { expr: `sum(1)(2)(3)()`, expected: 6 },
      { expr: `sum(5)()`, expected: 5 },
      { expr: `sum(1)(2)(3)(4)()`, expected: 10 },
      { expr: `sum(-1)(1)()`, expected: 0 },
    ],
  },
  {
    id: "my-map",
    title: "Polyfill: myMap",
    difficulty: "medium",
    statement: `Write mapArray(arr, callback) that works exactly like arr.map(callback) — WITHOUT using .map.

The callback receives (element, index, array).`,
    examples: [
      `mapArray([1,2,3], x => x * 2)        // [2,4,6]`,
      `mapArray(["a","b"], (x,i) => x + i)  // ["a0","b1"]`,
    ],
    starter: `function mapArray(arr, callback) {
  // loop + push, calling callback(element, index, array)
}
`,
    tests: [
      { expr: `mapArray([1,2,3], x => x * 2)`, expected: [2, 4, 6] },
      { expr: `mapArray(["a","b"], (x,i) => x + i)`, expected: ["a0", "b1"] },
      { expr: `mapArray([], x => x)`, expected: [] },
      { expr: `mapArray([1,2], (x,i,arr) => arr.length)`, expected: [2, 2] },
    ],
  },
  {
    id: "promise-all",
    title: "Polyfill: Promise.all",
    difficulty: "hard",
    statement: `Write promiseAll(promises) that works like Promise.all:
• resolves with an array of results IN THE ORIGINAL ORDER
• rejects immediately if ANY promise rejects
• handles non-promise values too

Do not use Promise.all internally!`,
    examples: [
      `promiseAll([Promise.resolve(1), 2, Promise.resolve(3)])
// resolves → [1, 2, 3]`,
    ],
    starter: `function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    // track results by index + a completed counter
  });
}
`,
    tests: [
      { expr: `promiseAll([Promise.resolve(1), 2, Promise.resolve(3)])`, expected: [1, 2, 3] },
      { expr: `promiseAll([])`, expected: [] },
      { expr: `promiseAll([new Promise(r => setTimeout(() => r("slow"), 50)), Promise.resolve("fast")])`, expected: ["slow", "fast"] },
      { expr: `promiseAll([Promise.reject(new Error("boom")), Promise.resolve(1)]).catch(e => "caught:" + e.message)`, expected: "caught:boom" },
    ],
  },
];
