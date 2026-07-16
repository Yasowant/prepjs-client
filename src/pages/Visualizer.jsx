import { useEffect, useRef, useState } from "react";
import { SCENARIOS } from "../data/visualizer.js";
import { traceProgram } from "../utils/eventLoopTracer.js";

const CUSTOM_SAMPLE = `console.log("start");

setTimeout(() => {
  console.log("timer done");
}, 100);

Promise.resolve()
  .then(() => console.log("promise 1"))
  .then(() => console.log("promise 2"));

console.log("end");`;

const levelClass = (l) => (l === "basic" ? "basic" : l === "intermediate" ? "intermediate" : "advanced");

function Box({ title, icon, items, accent, emptyText }) {
  return (
    <div className={`viz-box ${accent}`}>
      <div className="viz-box-title">{icon} {title}</div>
      <div className="viz-box-body">
        {items.length === 0 && <span className="viz-empty">{emptyText}</span>}
        {items.map((item, i) => (
          <div className="viz-item" key={`${item}-${i}`} style={{ animationDelay: `${i * 60}ms` }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Visualizer() {
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [customCode, setCustomCode] = useState(CUSTOM_SAMPLE);
  const [customError, setCustomError] = useState(null);
  const timerRef = useRef(null);

  const step = scenario.steps[stepIndex];
  const isLast = stepIndex === scenario.steps.length - 1;

  function pick(s) {
    setCustomMode(false);
    setScenario(s);
    setStepIndex(0);
    setPlaying(false);
  }

  function visualizeCustom(code = customCode) {
    setCustomError(null);
    setPlaying(false);
    const result = traceProgram(code);
    if (result.error) {
      setCustomError(result.error);
      return;
    }
    setScenario({
      id: "custom",
      title: "Your code",
      level: "custom",
      code: code.split("\n"),
      steps: result.steps,
    });
    setStepIndex(0);
  }

  function enterCustomMode() {
    setCustomMode(true);
    visualizeCustom(customCode);
  }

  function next() {
    setStepIndex((i) => Math.min(i + 1, scenario.steps.length - 1));
  }
  function prev() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  // autoplay
  useEffect(() => {
    if (!playing) return;
    if (isLast) return setPlaying(false);
    timerRef.current = setTimeout(next, 2200);
    return () => clearTimeout(timerRef.current);
  }, [playing, stepIndex]); // eslint-disable-line

  // keyboard: ← → space
  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === " ") { e.preventDefault(); setPlaying((p) => !p); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scenario]); // eslint-disable-line

  return (
    <div className="page viz-page">
      <h1>⏳ Event Loop Visualizer</h1>
      <p className="page-sub">
        Watch JavaScript execute step by step — call stack, Web APIs, microtask &
        task queues. The #1 interview topic, finally visible.
      </p>

      {/* scenario picker */}
      <div className="chip-row">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            className={`chip ${!customMode && scenario.id === s.id ? "active" : ""}`}
            onClick={() => pick(s)}
          >
            {s.title}
          </button>
        ))}
        <button
          className={`chip viz-custom-chip ${customMode ? "active" : ""}`}
          onClick={enterCustomMode}
        >
          ✏️ Your own code
        </button>
      </div>

      <div className="viz-layout">
        {/* code panel */}
        <div className="viz-code">
          <div className="viz-code-title">
            <span>{customMode ? "YOUR CODE" : "CODE"}</span>
            {customMode ? (
              <span className="free-badge">✏️ CUSTOM</span>
            ) : (
              <span className={`level-badge ${levelClass(scenario.level)}`}>{scenario.level}</span>
            )}
          </div>

          {customMode ? (
            <div className="viz-editor">
              <textarea
                className="viz-textarea"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                spellCheck={false}
                rows={14}
              />
              {customError && <div className="viz-error">⚠️ {customError}</div>}
              <div className="viz-editor-actions">
                <button className="btn btn-primary" onClick={() => visualizeCustom()}>
                  🔬 Visualize
                </button>
                <span className="viz-supported">
                  Supports: console.log · setTimeout · Promise/.then · new Promise · queueMicrotask
                </span>
              </div>
            </div>
          ) : (
            <pre>
              {scenario.code.map((codeLine, i) => (
                <div
                  key={i}
                  className={`viz-line ${step.line === i + 1 ? "active" : ""}`}
                >
                  <span className="viz-lineno">{i + 1}</span>
                  {codeLine}
                </div>
              ))}
            </pre>
          )}

          {/* console */}
          <div className="viz-console">
            <div className="viz-box-title">🖥 Console</div>
            <div className="viz-console-body">
              {step.out.length === 0 && <span className="viz-empty">— no output yet —</span>}
              {step.out.map((line, i) => (
                <div className="viz-out" key={i}>▸ {line}</div>
              ))}
            </div>
          </div>
        </div>

        {/* runtime panels */}
        <div className="viz-runtime">
          <div className="viz-grid">
            <Box title="Call Stack" icon="🥞" items={[...step.stack].reverse()} accent="stack" emptyText="empty — event loop can act!" />
            <Box title="Web APIs" icon="🌐" items={step.webapis} accent="webapi" emptyText="idle" />
            <Box title="Microtask Queue" icon="⚡" items={step.micro} accent="micro" emptyText="empty" />
            <Box title="Task Queue" icon="📥" items={step.macro} accent="macro" emptyText="empty" />
          </div>

          {/* explanation */}
          <div className="viz-note" key={stepIndex}>
            💡 {step.note}
          </div>

          {/* controls */}
          <div className="viz-controls">
            <button className="btn btn-outline" onClick={() => { setStepIndex(0); setPlaying(false); }}>⏮ Reset</button>
            <button className="btn btn-outline" onClick={prev} disabled={stepIndex === 0}>← Prev</button>
            <button className="btn btn-primary" onClick={() => (isLast ? setStepIndex(0) : setPlaying(!playing))}>
              {isLast ? "↺ Replay" : playing ? "⏸ Pause" : "▶ Play"}
            </button>
            <button className="btn btn-outline" onClick={next} disabled={isLast}>Next →</button>
            <span className="viz-progress">
              Step {stepIndex + 1}/{scenario.steps.length}
            </span>
          </div>
          <div className="viz-progressbar">
            <div className="viz-progressfill" style={{ width: `${((stepIndex + 1) / scenario.steps.length) * 100}%` }} />
          </div>
          <p className="viz-hint">⌨️ Use ← → arrow keys to step, Space to play/pause</p>
        </div>
      </div>
    </div>
  );
}
