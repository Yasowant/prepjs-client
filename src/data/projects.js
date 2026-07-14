// Scenario-based practice projects — real-world briefs, console-driven.
// Each runs fully in the sandboxed playground worker.

export const PROJECTS_DATA = [
  {
    id: "proj-shopping-cart",
    title: "Shopping Cart Module",
    difficulty: "easy",
    scenario:
      "You've joined an e-commerce startup. The checkout team needs a cart module before the UI is ready — everything must work as pure JavaScript functions.",
    requirements: [
      "addItem(name, price, qty) — adds a product (same name twice → increase qty)",
      "removeItem(name) — removes a product completely",
      "getTotal() — total price of everything in the cart",
      "applyCoupon(code) — 'SAVE10' gives 10% off the total",
      "getCart() — list of items for the UI team",
    ],
    expected: `addItem("Keyboard", 1000, 1)
addItem("Mouse", 500, 2)
getTotal()            // 2000
applyCoupon("SAVE10")
getTotal()            // 1800`,
    starter: `// 🛒 Shopping Cart Module
// Tip: keep 'items' private inside a closure or class!

function createCart() {
  const items = [];
  let discount = 0;

  return {
    addItem(name, price, qty = 1) {
      // TODO: if item exists, increase qty — else push
    },
    removeItem(name) {
      // TODO
    },
    getTotal() {
      // TODO: sum price*qty, then apply discount
    },
    applyCoupon(code) {
      // TODO: "SAVE10" → 10% off
    },
    getCart() {
      return [...items];
    },
  };
}

// --- try it ---
const cart = createCart();
cart.addItem("Keyboard", 1000, 1);
cart.addItem("Mouse", 500, 2);
console.log("Total:", cart.getTotal());     // expect 2000
cart.applyCoupon("SAVE10");
console.log("After coupon:", cart.getTotal()); // expect 1800
cart.removeItem("Mouse");
console.log("Cart:", cart.getCart());
`,
  },
  {
    id: "proj-bank-account",
    title: "Bank Account with Closures",
    difficulty: "easy",
    scenario:
      "A fintech interview classic: build a bank account where the balance is truly PRIVATE — no one should be able to do account.balance = 1000000. Only methods can touch it.",
    requirements: [
      "createAccount(owner, initialBalance) returns an account object",
      "deposit(amount) — rejects negative/zero amounts",
      "withdraw(amount) — rejects if insufficient balance",
      "getBalance() — the only way to read the balance",
      "getHistory() — array of all transactions like 'deposit: 500'",
    ],
    expected: `const acc = createAccount("Yaso", 1000)
acc.deposit(500)      // ok
acc.withdraw(2000)    // "Insufficient funds"
acc.getBalance()      // 1500
acc.balance           // undefined ✅ (private!)`,
    starter: `// 🏦 Bank Account — balance must be PRIVATE (closure!)

function createAccount(owner, initialBalance = 0) {
  let balance = initialBalance;   // private via closure
  const history = [];

  return {
    deposit(amount) {
      // TODO: validate amount > 0, update balance, push to history
    },
    withdraw(amount) {
      // TODO: validate amount and sufficient funds
    },
    getBalance() {
      // TODO
    },
    getHistory() {
      // TODO
    },
  };
}

// --- try it ---
const acc = createAccount("Yaso", 1000);
acc.deposit(500);
acc.withdraw(2000);            // should NOT work
acc.withdraw(300);
console.log("Balance:", acc.getBalance());  // expect 1200
console.log("History:", acc.getHistory());
console.log("Direct access:", acc.balance); // undefined ✅
`,
  },
  {
    id: "proj-todo-engine",
    title: "Todo List Engine",
    difficulty: "easy",
    scenario:
      "Your team is building a todo app. The React devs handle UI — you own the state engine. It must support adding, completing, filtering and stats, all immutably.",
    requirements: [
      "addTodo(text) — returns the new todo { id, text, done: false }",
      "toggleTodo(id) — flips done status",
      "filterTodos('all' | 'active' | 'done') — returns matching todos",
      "getStats() — { total, active, done, percentDone }",
      "Never mutate the todos array directly — always create new arrays",
    ],
    expected: `addTodo("Learn closures")
addTodo("Master event loop")
toggleTodo(1)
getStats()  // { total: 2, active: 1, done: 1, percentDone: 50 }`,
    starter: `// ✅ Todo List Engine — immutable state updates only!

let todos = [];
let nextId = 1;

function addTodo(text) {
  // TODO: todos = [...todos, newTodo]
}

function toggleTodo(id) {
  // TODO: todos = todos.map(...)
}

function filterTodos(filter = "all") {
  // TODO: "all" | "active" | "done"
}

function getStats() {
  // TODO: { total, active, done, percentDone }
}

// --- try it ---
addTodo("Learn closures");
addTodo("Master event loop");
addTodo("Build PrepJS project");
toggleTodo(1);
console.log("Active:", filterTodos("active"));
console.log("Done:", filterTodos("done"));
console.log("Stats:", getStats());
`,
  },
  {
    id: "proj-quiz-engine",
    title: "Quiz Game Engine",
    difficulty: "medium",
    scenario:
      "PrepJS itself needs a quiz engine (very meta 😄). Build the logic that serves questions one by one, checks answers, tracks score, and produces a final report.",
    requirements: [
      "createQuiz(questions) — takes [{ q, options, answer }]",
      "getCurrentQuestion() — question WITHOUT revealing the answer",
      "submitAnswer(index) — returns { correct, explanation? } and advances",
      "isFinished() — true when all questions answered",
      "getReport() — { score, total, percent, passed } (pass = 60%+)",
    ],
    expected: `quiz.getCurrentQuestion()  // { q: "...", options: [...] }
quiz.submitAnswer(1)       // { correct: true }
quiz.getReport()           // { score: 2, total: 3, percent: 67, passed: true }`,
    starter: `// 🎮 Quiz Game Engine

function createQuiz(questions) {
  let current = 0;
  let score = 0;

  return {
    getCurrentQuestion() {
      // TODO: return { q, options } — never the answer!
    },
    submitAnswer(index) {
      // TODO: check, update score, advance current
    },
    isFinished() {
      // TODO
    },
    getReport() {
      // TODO: { score, total, percent, passed }
    },
  };
}

// --- try it ---
const quiz = createQuiz([
  { q: "typeof null?", options: ["'null'", "'object'"], answer: 1 },
  { q: "[] == ![] ?", options: ["true", "false"], answer: 0 },
  { q: "NaN === NaN?", options: ["true", "false"], answer: 1 },
]);

console.log(quiz.getCurrentQuestion());
console.log(quiz.submitAnswer(1)); // correct
console.log(quiz.submitAnswer(1)); // wrong
console.log(quiz.submitAnswer(1)); // correct
console.log("Report:", quiz.getReport());
`,
  },
  {
    id: "proj-event-emitter",
    title: "Notification System (EventEmitter)",
    difficulty: "medium",
    scenario:
      "Your app needs a notification system: when a user gets a message, multiple parts of the app (badge counter, toast, sound) must react. Build the pub-sub engine behind it.",
    requirements: [
      "on(event, callback) — subscribe; returns an unsubscribe function",
      "emit(event, ...data) — notify ALL subscribers with the data",
      "off(event, callback) — remove one subscriber",
      "once(event, callback) — fires only the first time",
    ],
    expected: `const off = bus.on("message", showToast)
bus.on("message", updateBadge)
bus.emit("message", "Hi!")   // both fire
off()                        // unsubscribe toast
bus.emit("message", "Yo!")   // only badge fires`,
    starter: `// 🔔 Notification System — the Observer pattern

class EventEmitter {
  #listeners = {};

  on(event, callback) {
    // TODO: store callback, return () => this.off(event, callback)
  }

  off(event, callback) {
    // TODO: remove that callback
  }

  emit(event, ...data) {
    // TODO: call every subscriber with data
  }

  once(event, callback) {
    // TODO: wrap callback so it removes itself after first call
  }
}

// --- try it ---
const bus = new EventEmitter();

const offToast = bus.on("message", (text) => console.log("🍞 Toast:", text));
bus.on("message", (text) => console.log("🔴 Badge +1 for:", text));
bus.once("login", (user) => console.log("👋 Welcome", user));

bus.emit("message", "You got mail!");
bus.emit("login", "Yaso");
bus.emit("login", "again?");   // once → should NOT fire

offToast();                     // unsubscribe the toast
bus.emit("message", "Second message");  // only badge fires
`,
  },
  {
    id: "proj-rate-limiter",
    title: "API Rate Limiter",
    difficulty: "medium",
    scenario:
      "Your API is getting hammered. Build the rate limiter middleware logic: each user may make N requests per time window — extra requests get rejected until the window passes.",
    requirements: [
      "createRateLimiter(maxRequests, windowMs)",
      "isAllowed(userId, now) — true/false (now = timestamp, passed in for testing)",
      "Old requests outside the window must not count (sliding window)",
      "Different users tracked independently",
    ],
    expected: `const limiter = createRateLimiter(3, 1000)
limiter.isAllowed("u1", 0)     // true
limiter.isAllowed("u1", 100)   // true
limiter.isAllowed("u1", 200)   // true
limiter.isAllowed("u1", 300)   // false ❌ (4th in window)
limiter.isAllowed("u1", 1200)  // true ✅ (window slid)`,
    starter: `// 🚦 API Rate Limiter — sliding window

function createRateLimiter(maxRequests, windowMs) {
  const requests = new Map(); // userId → array of timestamps

  return {
    isAllowed(userId, now = Date.now()) {
      // TODO:
      // 1. get this user's timestamps
      // 2. drop timestamps older than (now - windowMs)
      // 3. if remaining < maxRequests → record 'now', return true
      // 4. else return false
    },
  };
}

// --- try it (3 requests per second) ---
const limiter = createRateLimiter(3, 1000);
console.log(limiter.isAllowed("u1", 0));    // true
console.log(limiter.isAllowed("u1", 100));  // true
console.log(limiter.isAllowed("u1", 200));  // true
console.log(limiter.isAllowed("u1", 300));  // false ❌
console.log(limiter.isAllowed("u2", 300));  // true (different user)
console.log(limiter.isAllowed("u1", 1200)); // true ✅ window slid
`,
  },
  {
    id: "proj-undo-redo",
    title: "Text Editor Undo/Redo",
    difficulty: "medium",
    scenario:
      "You're building a mini text editor. Product wants Ctrl+Z and Ctrl+Y. Implement the history engine with two stacks — the classic interview data-structure question.",
    requirements: [
      "type(text) — appends text (clears the redo stack!)",
      "undo() — reverts the last change",
      "redo() — re-applies an undone change",
      "getText() — current content",
      "Typing after an undo must clear the redo history",
    ],
    expected: `type("Hello")
type(" World")
undo()          // "Hello"
redo()          // "Hello World"
undo(); type("!")  // "Hello!" — redo stack cleared`,
    starter: `// ↩️ Undo/Redo Engine — two stacks

function createEditor() {
  let text = "";
  const undoStack = [];
  const redoStack = [];

  return {
    type(newText) {
      // TODO: push current text to undoStack, append, clear redoStack
    },
    undo() {
      // TODO: move current → redoStack, restore from undoStack
    },
    redo() {
      // TODO: reverse of undo
    },
    getText() {
      return text;
    },
  };
}

// --- try it ---
const editor = createEditor();
editor.type("Hello");
editor.type(" World");
console.log(editor.getText()); // "Hello World"
editor.undo();
console.log(editor.getText()); // "Hello"
editor.redo();
console.log(editor.getText()); // "Hello World"
editor.undo();
editor.type("!");
console.log(editor.getText()); // "Hello!"
editor.redo();
console.log(editor.getText()); // still "Hello!" (redo cleared)
`,
  },
  {
    id: "proj-lru-cache",
    title: "LRU Cache for API Results",
    difficulty: "hard",
    scenario:
      "Your app calls a slow API. Cache the results — but memory is limited to N entries. When full, evict the LEAST RECENTLY USED entry. Asked at FAANG constantly.",
    requirements: [
      "createLRU(capacity) — max N entries",
      "get(key) — returns value AND marks it as recently used (or null)",
      "put(key, value) — adds/updates; evicts the LRU entry when full",
      "Tip: JavaScript's Map remembers insertion order — use it!",
    ],
    expected: `const cache = createLRU(2)
cache.put("a", 1); cache.put("b", 2)
cache.get("a")     // 1 (a is now most recent)
cache.put("c", 3)  // evicts "b" (least recent)
cache.get("b")     // null`,
    starter: `// 🧠 LRU Cache — Map keeps insertion order, use that!

function createLRU(capacity) {
  const cache = new Map();

  return {
    get(key) {
      // TODO: if missing → null
      // if found: delete + re-set to mark as most recent, return value
    },
    put(key, value) {
      // TODO: if key exists, delete it first
      // if at capacity, evict oldest: cache.keys().next().value
      // then set
    },
    debug() {
      return [...cache.entries()];
    },
  };
}

// --- try it ---
const cache = createLRU(2);
cache.put("a", 1);
cache.put("b", 2);
console.log(cache.get("a"));  // 1
cache.put("c", 3);            // evicts "b"
console.log(cache.get("b"));  // null ✅
console.log(cache.get("c"));  // 3
console.log("state:", cache.debug());
`,
  },
  {
    id: "proj-flaky-api",
    title: "Resilient API Caller (Retry + Timeout)",
    difficulty: "hard",
    scenario:
      "Your payment provider's API fails 50% of the time (yikes). Build a resilient caller: retry with exponential backoff, give up after N attempts, and never hang forever.",
    requirements: [
      "retryWithBackoff(fn, maxAttempts, baseDelay)",
      "Retry on failure: wait baseDelay, then 2×, then 4× (exponential)",
      "After maxAttempts failures → throw the last error",
      "Log each attempt so you can see the backoff working",
      "Bonus: add withTimeout(promise, ms) using Promise.race",
    ],
    expected: `await retryWithBackoff(flakyPayment, 4, 100)
// attempt 1 failed, retrying in 100ms…
// attempt 2 failed, retrying in 200ms…
// attempt 3 succeeded ✅ → "payment-ok"`,
    starter: `// 🔁 Resilient API Caller — retry + exponential backoff

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// simulated flaky API — fails ~50% of the time
async function flakyPayment() {
  await sleep(50);
  if (Math.random() < 0.5) throw new Error("Gateway timeout");
  return "payment-ok";
}

async function retryWithBackoff(fn, maxAttempts = 4, baseDelay = 100) {
  // TODO:
  // for each attempt: try fn() and return result
  // on failure: log, wait baseDelay * 2^(attempt-1), continue
  // after last attempt: throw the error
}

// Bonus: timeout wrapper
function withTimeout(promise, ms) {
  // TODO: Promise.race against a rejecting timer
}

// --- try it ---
retryWithBackoff(flakyPayment, 4, 100)
  .then((res) => console.log("✅ Success:", res))
  .catch((err) => console.log("❌ Gave up:", err.message));
`,
  },
];
