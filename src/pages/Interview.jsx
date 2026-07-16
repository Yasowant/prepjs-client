import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { BADGE_META } from "../data/badges.js";

const SECONDS_PER_QUESTION = 180; // 3 minutes

const TOPICS = [
  { id: "javascript", icon: "🟨", name: "JavaScript", desc: "Core JS — closures, event loop, async, prototypes" },
  { id: "react", icon: "⚛️", name: "React.js", desc: "Hooks, rendering, state, performance" },
  { id: "fullstack", icon: "🌐", name: "Full Stack", desc: "JS + React + Node.js mixed round" },
];

const LEVELS = [
  { id: "junior", name: "Junior", desc: "0–2 years" },
  { id: "mid", name: "Mid-level", desc: "2–4 years" },
  { id: "senior", name: "Senior", desc: "4+ years" },
];

export const SIGNAL_META = {
  "strong yes": { icon: "🚀", cls: "good" },
  yes: { icon: "✅", cls: "good" },
  borderline: { icon: "🤔", cls: "mid" },
  "not yet": { icon: "📚", cls: "bad" },
};

const SR = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
const MAX_UPLOAD_BYTES = 95 * 1024 * 1024; // Cloudinary free plan caps ~100MB/file

export default function Interview() {
  const [phase, setPhase] = useState("setup"); // setup | loading | live | evaluating | result | error
  const [mode, setMode] = useState(SR ? "voice" : "text");
  const [record, setRecord] = useState(true);
  const [topic, setTopic] = useState("javascript");
  const [level, setLevel] = useState("junior");
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [draft, setDraft] = useState("");
  const [interim, setInterim] = useState("");
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [hasCam, setHasCam] = useState(false);
  const [uploadState, setUploadState] = useState(null); // null | uploading | done | failed | toobig
  const [history, setHistory] = useState([]);

  const timerRef = useRef(null);
  const draftRef = useRef("");
  const answersRef = useRef([]);
  const submitRef = useRef(() => {});
  const recognitionRef = useRef(null);
  const listeningRef = useRef(false);
  const streamRef = useRef(null);
  const videoRef = useRef(null);
  const modeRef = useRef(mode);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const blobRef = useRef(null);

  useEffect(() => { draftRef.current = draft; }, [draft]);
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { submitRef.current = submitAnswer; });
  useEffect(() => { modeRef.current = mode; }, [mode]);

  function loadHistory() {
    api("/interview/history", { auth: true }).then(setHistory).catch(() => {});
  }
  useEffect(loadHistory, []);

  /* ---------- speech ---------- */

  function stopListening() {
    listeningRef.current = false;
    setListening(false);
    setInterim("");
    try { recognitionRef.current?.stop(); } catch { /* noop */ }
  }

  function startListening() {
    if (!SR) return;
    try { recognitionRef.current?.stop(); } catch { /* noop */ }
    const rec = new SR();
    rec.lang = "en-IN";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t + " ";
        else interimText += t;
      }
      if (finalText) setDraft((d) => (d ? d + " " : "") + finalText.trim());
      setInterim(interimText);
    };
    rec.onend = () => {
      if (listeningRef.current) {
        try { rec.start(); } catch { /* noop */ }
      }
    };
    rec.onerror = () => { /* non-fatal — user can type */ };
    recognitionRef.current = rec;
    listeningRef.current = true;
    setListening(true);
    try { rec.start(); } catch { /* noop */ }
  }

  function speakQuestion(text) {
    if (!window.speechSynthesis) return;
    stopListening();
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    const voices = window.speechSynthesis.getVoices();
    u.voice =
      voices.find((v) => /en[-_](IN|US|GB)/i.test(v.lang) && /google/i.test(v.name)) ||
      voices.find((v) => v.lang?.toLowerCase().startsWith("en")) ||
      null;
    u.onstart = () => setSpeaking(true);
    u.onend = () => {
      setSpeaking(false);
      if (modeRef.current === "voice") startListening();
    };
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }

  /* ---------- recording ---------- */

  function startRecorder() {
    if (!streamRef.current || typeof MediaRecorder === "undefined") return;
    chunksRef.current = [];
    blobRef.current = null;
    try {
      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
        ? "video/webm;codecs=vp8,opus"
        : "video/webm";
      const rec = new MediaRecorder(streamRef.current, {
        mimeType: mime,
        videoBitsPerSecond: 450_000, // small files — a full interview stays well under limits
        audioBitsPerSecond: 64_000,
      });
      rec.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      rec.start(1000);
      recorderRef.current = rec;
    } catch { /* recording unsupported — interview continues */ }
  }

  function stopRecorder() {
    return new Promise((resolve) => {
      const rec = recorderRef.current;
      if (!rec || rec.state === "inactive") return resolve(blobRef.current);
      rec.onstop = () => {
        blobRef.current = new Blob(chunksRef.current, { type: "video/webm" });
        resolve(blobRef.current);
      };
      try { rec.stop(); } catch { resolve(null); }
    });
  }

  async function uploadVideo(id) {
    const blob = blobRef.current;
    if (!blob || !id) return;
    if (blob.size > MAX_UPLOAD_BYTES) return setUploadState("toobig");
    setUploadState("uploading");
    try {
      const sig = await api("/interview/video-signature", { auth: true });
      const fd = new FormData();
      fd.append("file", blob);
      fd.append("api_key", sig.apiKey);
      fd.append("timestamp", sig.timestamp);
      fd.append("folder", sig.folder);
      fd.append("signature", sig.signature);
      const up = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/video/upload`, {
        method: "POST",
        body: fd,
      });
      const data = await up.json().catch(() => ({}));
      if (!up.ok || !data.secure_url) throw new Error(data?.error?.message || "upload failed");
      await api(`/interview/${id}/video`, {
        method: "POST",
        auth: true,
        body: { videoUrl: data.secure_url },
      });
      setUploadState("done");
      loadHistory();
    } catch {
      setUploadState("failed");
    }
  }

  function stopMedia() {
    stopListening();
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setHasCam(false);
  }

  useEffect(() => () => { stopMedia(); try { recorderRef.current?.stop(); } catch { /* noop */ } }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase === "live" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [phase, hasCam]);

  useEffect(() => {
    if (phase === "live" && mode === "voice" && questions[current]) {
      speakQuestion(questions[current]);
    }
  }, [phase, current]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- countdown ---------- */
  useEffect(() => {
    if (phase !== "live") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setTimeout(() => submitRef.current(), 0);
          return SECONDS_PER_QUESTION;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, current]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- flow ---------- */

  async function start() {
    setPhase("loading");
    setError("");
    setUploadState(null);
    try {
      if (mode === "voice") {
        try {
          streamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setHasCam(true);
        } catch { setHasCam(false); }
      }
      const { questions: qs } = await api("/interview/start", {
        method: "POST",
        auth: true,
        body: { topic, level },
      });
      setQuestions(qs);
      setAnswers([]);
      setCurrent(0);
      setDraft("");
      setTimeLeft(SECONDS_PER_QUESTION);
      if (mode === "voice" && record && streamRef.current) startRecorder();
      setPhase("live");
    } catch (err) {
      stopMedia();
      setError(err.message);
      setPhase("error");
    }
  }

  function submitAnswer() {
    stopListening();
    window.speechSynthesis?.cancel();
    const next = [
      ...answersRef.current,
      { question: questions[current], answer: draftRef.current },
    ];
    setAnswers(next);
    if (current + 1 < questions.length) {
      setCurrent((c) => c + 1);
      setDraft("");
      setTimeLeft(SECONDS_PER_QUESTION);
    } else {
      evaluate(next);
    }
  }

  async function evaluate(qa) {
    clearInterval(timerRef.current);
    await stopRecorder();
    stopMedia();
    setPhase("evaluating");
    try {
      const data = await api("/interview/evaluate", {
        method: "POST",
        auth: true,
        body: { topic, level, qa },
      });
      setResult(data);
      setPhase("result");
      loadHistory();
      if (blobRef.current && record && mode === "voice") uploadVideo(data.id);
    } catch (err) {
      setError(err.message);
      setPhase("error");
    }
  }

  function reset() {
    stopMedia();
    blobRef.current = null;
    setUploadState(null);
    setPhase("setup");
    setResult(null);
    setError("");
    loadHistory();
  }

  const mm = String(Math.floor(timeLeft / 60)).padStart(1, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  /* ================ setup ================ */
  if (phase === "setup" || phase === "loading" || phase === "error") {
    return (
      <div className="page interview-page">
        <h1>🎤 Mock Interview</h1>
        <p className="page-sub">
          A real interview simulation: <strong>7 questions</strong> starting with “introduce
          yourself”, the AI asks out loud, you <strong>answer by speaking on camera</strong>
          (or type), everything is scored /10 with feedback — and the full report{" "}
          <strong>plus your video is saved</strong> so you can review your performance anytime.
        </p>

        {phase === "error" && (
          <div className="interview-error">⚠️ {error} <button className="btn btn-outline" onClick={reset}>Try again</button></div>
        )}

        <h2 className="iv-h2">1 · Interview style</h2>
        <div className="iv-level-row">
          <button
            className={`iv-level ${mode === "voice" ? "selected" : ""}`}
            onClick={() => setMode("voice")}
            disabled={!SR}
            title={SR ? "" : "Voice needs Chrome or Edge"}
          >
            <strong>🎥 Voice + Video</strong> <span>AI speaks, you answer aloud</span>
          </button>
          <button className={`iv-level ${mode === "text" ? "selected" : ""}`} onClick={() => setMode("text")}>
            <strong>⌨️ Text</strong> <span>read & type answers</span>
          </button>
          {mode === "voice" && (
            <button className={`iv-level ${record ? "selected" : ""}`} onClick={() => setRecord(!record)}>
              <strong>{record ? "⏺ Recording ON" : "⏺ Recording OFF"}</strong>{" "}
              <span>save video to your account</span>
            </button>
          )}
        </div>
        {!SR && (
          <p className="iv-note">🎥 Voice mode needs <strong>Chrome or Edge</strong>. You're set up for text mode.</p>
        )}
        {SR && mode === "voice" && (
          <p className="iv-note">
            Your browser will ask for camera & mic permission. Speech is transcribed live in your browser;
            {record ? " the video is saved privately to your account so you can rewatch it." : " nothing is recorded."}
          </p>
        )}

        <h2 className="iv-h2">2 · Pick your track</h2>
        <div className="iv-topic-grid">
          {TOPICS.map((t) => (
            <button key={t.id} className={`iv-topic ${topic === t.id ? "selected" : ""}`} onClick={() => setTopic(t.id)}>
              <span className="iv-topic-icon">{t.icon}</span>
              <strong>{t.name}</strong>
              <span className="iv-topic-desc">{t.desc}</span>
            </button>
          ))}
        </div>

        <h2 className="iv-h2">3 · Experience level</h2>
        <div className="iv-level-row">
          {LEVELS.map((l) => (
            <button key={l.id} className={`iv-level ${level === l.id ? "selected" : ""}`} onClick={() => setLevel(l.id)}>
              <strong>{l.name}</strong> <span>{l.desc}</span>
            </button>
          ))}
        </div>

        <button className="btn btn-primary iv-start" onClick={start} disabled={phase === "loading"}>
          {phase === "loading" ? "⏳ Preparing your interview…" : "🎬 Start interview"}
        </button>
        <p className="iv-note">Tip: for “introduce yourself”, use the formula — background → key skills → one strong project → why this role.</p>

        {/* past interviews */}
        {history.length > 0 && (
          <>
            <h2 className="iv-h2">📜 Your past interviews</h2>
            <div className="iv-history">
              {history.map((h) => {
                const sig = SIGNAL_META[h.hireSignal] || SIGNAL_META.borderline;
                return (
                  <Link to={`/interview/review/${h._id}`} className="iv-history-row" key={h._id}>
                    <span className="iv-history-topic">
                      {TOPICS.find((t) => t.id === h.topic)?.icon || "🎤"} {TOPICS.find((t) => t.id === h.topic)?.name || h.topic}
                      <em> · {h.level}</em>
                    </span>
                    <span className={`iv-qscore ${sig.cls === "good" ? "good" : sig.cls === "mid" ? "mid" : "bad"}`}>
                      {h.total}/{h.outOf}
                    </span>
                    <span className="iv-history-signal">{sig.icon} {h.hireSignal}</span>
                    {h.videoUrl && <span className="iv-history-video">🎥</span>}
                    <span className="iv-history-date">{new Date(h.createdAt).toLocaleDateString()}</span>
                    <span className="history-arrow">→</span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  /* ================ live ================ */
  if (phase === "live") {
    return (
      <div className="page interview-page">
        <div className="iv-live-top">
          <span className="iv-progress">
            Question {current + 1} / {questions.length}
            {recorderRef.current?.state === "recording" && <em className="iv-rec"> ● REC</em>}
          </span>
          <span className={`iv-timer ${timeLeft <= 30 ? "danger" : ""}`}>⏱ {mm}:{ss}</span>
        </div>
        <div className="iv-progress-bar">
          <div className="iv-progress-fill" style={{ width: `${(current / questions.length) * 100}%` }} />
        </div>

        {mode === "voice" && (
          <div className="iv-video-row">
            <div className={`iv-ai-card ${speaking ? "speaking" : ""}`}>
              <div className="iv-ai-avatar">🤖</div>
              <div className="iv-sound-bars"><span /><span /><span /><span /><span /></div>
              <span className="iv-cam-label">AI Interviewer</span>
              <span className="iv-ai-status">
                {speaking ? "🔊 Asking…" : listening ? "👂 Listening to you" : "Waiting"}
              </span>
            </div>
            <div className={`iv-user-card ${listening ? "onair" : ""}`}>
              {hasCam ? (
                <video ref={videoRef} autoPlay muted playsInline />
              ) : (
                <div className="iv-no-cam">📷<br />Camera off</div>
              )}
              <span className="iv-cam-label">You {listening && <em className="iv-rec">● MIC LIVE</em>}</span>
            </div>
          </div>
        )}

        <div className="iv-question-card">
          <span className="iv-interviewer">🤖 Interviewer</span>
          <p className="iv-question">{questions[current]}</p>
          {mode === "voice" && (
            <button className="btn btn-outline iv-repeat" onClick={() => speakQuestion(questions[current])}>
              🔊 Repeat question
            </button>
          )}
        </div>

        <textarea
          className="iv-answer"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={mode === "voice"
            ? "Your spoken answer appears here — you can edit it before submitting…"
            : "Type your answer as you would say it aloud…"}
          autoFocus={mode === "text"}
        />
        {interim && <p className="iv-interim">🎙 “{interim}…”</p>}

        <div className="iv-actions">
          {mode === "voice" && (
            listening ? (
              <button className="btn btn-outline" onClick={stopListening}>⏸ Pause mic</button>
            ) : (
              <button className="btn btn-outline" onClick={startListening} disabled={speaking}>🎙 Resume mic</button>
            )
          )}
          <button className="btn btn-primary" onClick={() => submitAnswer()}>
            {current + 1 === questions.length ? "Submit final answer →" : "Next question →"}
          </button>
          <span className="iv-skip-hint">Empty answers score 0 — attempt something!</span>
        </div>
      </div>
    );
  }

  /* ================ evaluating ================ */
  if (phase === "evaluating") {
    return (
      <div className="page interview-page iv-center">
        <div className="iv-eval-spinner">🧑‍⚖️</div>
        <h2>Evaluating your answers…</h2>
        <p className="page-sub">The interviewer is reviewing all {questions.length} answers and writing feedback.</p>
      </div>
    );
  }

  /* ================ result ================ */
  const outOf = result?.outOf || (result?.results?.length || 0) * 10;
  const pct = outOf ? Math.round((result.total / outOf) * 100) : 0;
  const signal = SIGNAL_META[result?.hireSignal] || SIGNAL_META.borderline;

  return (
    <div className="page interview-page">
      <h1>📋 Interview Report</h1>

      {uploadState && (
        <div className={`iv-upload-bar ${uploadState}`}>
          {uploadState === "uploading" && "⬆️ Saving your interview video to your account…"}
          {uploadState === "done" && "✅ Video saved! Watch it anytime from your past interviews."}
          {uploadState === "toobig" && "⚠️ Recording too large to save (limit ~95MB) — report saved without video."}
          {uploadState === "failed" && (
            <>⚠️ Video upload failed — report is saved.{" "}
              <button className="btn btn-outline" onClick={() => uploadVideo(result.id)}>Retry</button>
            </>
          )}
        </div>
      )}

      <div className={`iv-verdict ${signal.cls}`}>
        <div className="iv-score-ring" style={{ "--pct": pct }}>
          <span>{result.total}<small>/{outOf}</small></span>
        </div>
        <div className="iv-verdict-body">
          <strong>{signal.icon} {result.hireSignal?.toUpperCase()}</strong>
          <p>{result.verdict}</p>
          <span className="iv-xp">+{result.xpGained} XP earned</span>
          {result.newBadges?.length > 0 && (
            <span className="iv-new-badges">
              🎖 New badge{result.newBadges.length > 1 ? "s" : ""}:{" "}
              {result.newBadges.map((b) => BADGE_META[b]?.name || b).join(", ")}
            </span>
          )}
        </div>
      </div>

      <h2 className="iv-h2">Question-by-question feedback</h2>
      {result.results.map((r, i) => (
        <div className="iv-feedback-card" key={i}>
          <div className="iv-feedback-head">
            <strong>Q{i + 1}. {answers[i]?.question}</strong>
            <span className={`iv-qscore ${r.score >= 7 ? "good" : r.score >= 4 ? "mid" : "bad"}`}>
              {r.score}/10
            </span>
          </div>
          <p className="iv-your-answer">
            <span>Your answer:</span> {answers[i]?.answer?.trim() || <em>(no answer)</em>}
          </p>
          <p className="iv-feedback">💬 {r.feedback}</p>
          <details className="iv-model-answer">
            <summary>✅ Model answer</summary>
            <p>{r.modelAnswer}</p>
          </details>
        </div>
      ))}

      <div className="iv-actions">
        <button className="btn btn-primary" onClick={reset}>🔁 New interview</button>
        <Link to="/dashboard" className="btn btn-outline">View dashboard</Link>
      </div>
    </div>
  );
}
