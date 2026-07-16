// Event Loop Tracer — runs user code with instrumented setTimeout / Promise /
// queueMicrotask / console and records a step-by-step execution trace that the
// Visualizer can play back.
//
// Supported: console.log, setTimeout, Promise.resolve().then() chains,
// new Promise(executor), queueMicrotask, nesting of all of the above.
// Not supported: async/await, fetch, setInterval, DOM (checked upfront).

const MAX_STEPS = 300;

export function traceProgram(source) {
  // upfront guards for unsupported syntax
  if (/\basync\b|\bawait\b/.test(source))
    return { error: "async/await isn't supported in custom mode yet — rewrite with Promise.resolve().then(…) to visualize the same flow." };
  if (/\bfetch\s*\(/.test(source))
    return { error: "fetch isn't supported — network timing can't be visualized deterministically. Use setTimeout to simulate a delay." };
  if (/\bsetInterval\s*\(/.test(source))
    return { error: "setInterval isn't supported — it never ends! Use setTimeout instead." };
  if (source.length > 2000)
    return { error: "Keep custom code under 2000 characters." };

  const steps = [];
  const out = [];
  const micro = []; // [{ label, fn }]
  const macro = []; // [{ label, fn, delay, seq }]
  const webapis = []; // [{ label, entry }]
  const stack = [];
  let timerN = 0;
  let thenN = 0;
  let stepOverflow = false;

  const fmt = (v) => {
    if (typeof v === "string") return v;
    try { return JSON.stringify(v) ?? String(v); } catch { return String(v); }
  };
  const short = (s) => (s.length > 18 ? s.slice(0, 15) + "…" : s);

  function snap(note) {
    if (steps.length >= MAX_STEPS) { stepOverflow = true; return; }
    steps.push({
      line: null,
      stack: [...stack],
      webapis: webapis.map((w) => w.label),
      micro: micro.map((m) => m.label),
      macro: macro.map((m) => m.label),
      out: [...out],
      note,
    });
  }

  /* ---------- instrumented APIs ---------- */

  const tracedConsole = {
    log: (...args) => {
      const text = args.map(fmt).join(" ");
      stack.push(`console.log("${short(text)}")`);
      out.push(text);
      snap(`console.log runs synchronously on the stack → prints "${short(text)}".`);
      stack.pop();
    },
  };
  tracedConsole.info = tracedConsole.warn = tracedConsole.error = tracedConsole.log;

  function tracedSetTimeout(cb, delay = 0) {
    if (typeof cb !== "function") return;
    timerN++;
    const name = `timerCb${timerN}`;
    webapis.push({
      label: `⏲ ${delay}ms → ${name}`,
      entry: { label: `${name} (${delay}ms)`, fn: cb, delay: Number(delay) || 0, seq: timerN },
    });
    stack.push(`setTimeout(${name}, ${delay})`);
    snap(`setTimeout hands ${name} to the Timer Web API — it does NOT run now, even with ${delay}ms.`);
    stack.pop();
  }

  function tracedQueueMicrotask(cb) {
    if (typeof cb !== "function") return;
    thenN++;
    const name = `microCb${thenN}`;
    micro.push({ label: name, fn: cb });
    stack.push(`queueMicrotask(${name})`);
    snap(`queueMicrotask puts ${name} straight into the MICROTASK queue.`);
    stack.pop();
  }

  class TracedPromise {
    constructor(executor) {
      this.settled = false;
      this.value = undefined;
      this.waiting = []; // callbacks registered before settle
      if (typeof executor === "function") {
        const resolve = (v) => this.#settle(v, false);
        executor(resolve, resolve); // reject treated like resolve (visual simplification)
      }
    }

    static resolve(v) {
      const p = new TracedPromise();
      p.settled = true;
      p.value = v;
      return p;
    }

    #settle(v, quiet) {
      if (this.settled) return;
      this.settled = true;
      this.value = v;
      if (this.waiting.length) {
        this.waiting.forEach((t) => micro.push(t));
        if (!quiet) snap(`The promise resolved → its ${this.waiting.length} pending .then callback(s) move to the MICROTASK queue.`);
        this.waiting = [];
      }
    }

    then(cb) {
      const next = new TracedPromise();
      thenN++;
      const name = `thenCb${thenN}`;
      const task = {
        label: name,
        fn: () => {
          stack.push(`${name}()`);
          snap(`Microtask ${name} is pushed onto the stack and runs.`);
          let result;
          try { result = typeof cb === "function" ? cb(this.value) : this.value; }
          catch (e) { out.push("⚠️ " + e.message); }
          stack.pop();
          if (result instanceof TracedPromise) {
            result.waiting.push(...next.waiting);
            if (result.settled) next.#settle(result.value, true);
          } else {
            next.#settle(result, next.waiting.length === 0);
          }
        },
      };
      if (this.settled) {
        micro.push(task);
        stack.push(".then(…)");
        snap(`The promise is already resolved → ${name} is queued as a MICROTASK immediately.`);
        stack.pop();
      } else {
        this.waiting.push(task);
        stack.push(".then(…)");
        snap(`The promise is still pending → ${name} is stored, waiting for resolve().`);
        stack.pop();
      }
      return next;
    }
    catch() { return this; }
    finally(cb) { return this.then(cb); }
  }

  function expireTimers(afterWhat) {
    if (!webapis.length) return;
    const entries = webapis.map((w) => w.entry).sort((a, b) => a.delay - b.delay || a.seq - b.seq);
    webapis.length = 0;
    entries.forEach((e) => macro.push(e));
    snap(`Timer(s) expired ${afterWhat} → callback(s) moved to the TASK QUEUE (sorted by delay, then registration order).`);
  }

  /* ---------- run the program ---------- */

  stack.push("global()");
  snap("Program starts — the global execution context is pushed onto the call stack.");

  try {
    const fn = new Function("console", "setTimeout", "Promise", "queueMicrotask", `"use strict";\n${source}`);
    fn(tracedConsole, tracedSetTimeout, TracedPromise, tracedQueueMicrotask);
  } catch (e) {
    return { error: "Your code threw an error: " + e.message };
  }

  stack.pop();
  snap("Global code finished — the call stack is EMPTY. Now the event loop takes over.");
  expireTimers("while sync code ran");

  /* ---------- event loop ---------- */

  let guard = 0;
  while ((micro.length || macro.length) && guard++ < 100 && !stepOverflow) {
    // 1. drain ALL microtasks
    while (micro.length && !stepOverflow) {
      const t = micro.shift();
      snap(`EVENT LOOP RULE: drain microtasks first → ${t.label} leaves the queue.`);
      t.fn(); // pushes its own stack frames + snaps
    }
    // 2. run ONE macrotask
    if (macro.length && !stepOverflow) {
      const t = macro.shift();
      stack.push(`${t.label.split(" ")[0]}()`);
      snap(`Microtasks empty → take ONE task from the Task Queue: ${t.label}.`);
      t.fn();
      stack.pop();
      expireTimers("during this task");
      if (micro.length) snap("Task finished. Before the next task, the loop checks microtasks again…");
      else snap("Task finished — back to the event loop.");
    }
  }

  if (stepOverflow) {
    steps.push({ line: null, stack: [], webapis: [], micro: [], macro: [], out: [...out],
      note: "⚠️ Trace truncated — too many steps. Simplify the code a little." });
  } else {
    snap(`🎉 Done! All queues empty. Final output: ${out.join("  →  ") || "(nothing printed)"}`);
  }

  return { steps };
}
