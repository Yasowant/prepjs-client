import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Flashcards() {
  const [all, setAll] = useState(null);
  const [track, setTrack] = useState("all"); // all | js | react
  const [deck, setDeck] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [again, setAgain] = useState(0);
  const [error, setError] = useState("");
  const totalRef = useRef(0);

  useEffect(() => {
    api("/concepts/questions", { auth: true })
      .then((d) => setAll(d.questions))
      .catch((e) => setError(e.message));
  }, []);

  const filtered = useMemo(() => {
    if (!all) return [];
    return track === "all" ? all : all.filter((q) => q.track === track);
  }, [all, track]);

  function start() {
    const d = shuffle(filtered);
    totalRef.current = d.length;
    setDeck(d);
    setIndex(0);
    setFlipped(false);
    setKnown(0);
    setAgain(0);
  }

  // start / restart whenever the filter changes and data is ready
  useEffect(() => {
    if (all) start();
  }, [all, track]); // eslint-disable-line react-hooks/exhaustive-deps

  const card = deck[index];
  const done = deck.length > 0 && index >= deck.length;

  function answer(knewIt) {
    if (!card) return;
    if (knewIt) {
      setKnown((k) => k + 1);
      setIndex((i) => i + 1);
    } else {
      setAgain((a) => a + 1);
      setDeck((d) => [...d, card]); // repeat at the end of the deck
      setIndex((i) => i + 1);
    }
    setFlipped(false);
  }

  // keyboard: Space = flip, K = knew it, R = revise again
  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key.toLowerCase() === "k" && flipped) {
        answer(true);
      } else if (e.key.toLowerCase() === "r" && flipped) {
        answer(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }); // re-bind each render so `card`/`flipped` are fresh

  if (error) return <div className="page"><p className="empty">{error}</p></div>;
  if (!all) return <div className="page-loader">Shuffling your deck…</div>;

  return (
    <div className="page flashcards-page">
      <h1>🃏 Flashcards</h1>
      <p className="page-sub">
        Rapid revision of every interview question. Flip the card, be honest —
        "Revise again" puts it back in the deck until you know it. Perfect for the
        night before an interview.
      </p>

      <div className="fc-controls">
        {[["all", "All"], ["js", "🟨 JavaScript"], ["react", "⚛️ React"]].map(([id, label]) => (
          <button
            key={id}
            className={`chip small rlab-diff-chip ${track === id ? "on" : ""}`}
            onClick={() => setTrack(id)}
          >
            {label}
          </button>
        ))}
        <span className="fc-progress">
          {done ? deck.length : Math.min(index + 1, deck.length)}/{deck.length} cards
          {again > 0 && ` · 🔁 ${again} repeating`}
        </span>
      </div>

      {done ? (
        <div className="fc-done">
          <div className="fc-done-icon">🎉</div>
          <h2>Deck complete!</h2>
          <p>
            {totalRef.current} unique questions · <strong>{known} known</strong> ·{" "}
            <strong>{again} sent back for revision</strong>
          </p>
          <div className="iv-actions" style={{ justifyContent: "center" }}>
            <button className="btn btn-primary" onClick={start}>🔁 Shuffle & go again</button>
            <Link to="/quiz" className="btn btn-outline">Take a quiz instead</Link>
          </div>
        </div>
      ) : card ? (
        <>
          <div className={`fc-card ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(!flipped)}>
            <div className="fc-inner">
              <div className="fc-face fc-front">
                <span className="fc-tag">{card.categoryIcon} {card.categoryName} · {card.level}</span>
                <p className="fc-question">{card.q}</p>
                <span className="fc-hint">Click or press Space to reveal</span>
              </div>
              <div className="fc-face fc-back">
                <span className="fc-tag">💡 Answer</span>
                <p className="fc-answer">{card.a}</p>
                <Link
                  to={`/concepts/${card.conceptId}`}
                  className="fc-concept-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  📖 Read full concept: {card.conceptTitle} →
                </Link>
              </div>
            </div>
          </div>

          <div className="fc-actions">
            {flipped ? (
              <>
                <button className="btn btn-outline fc-again" onClick={() => answer(false)}>
                  🔁 Revise again <kbd>R</kbd>
                </button>
                <button className="btn btn-primary fc-knew" onClick={() => answer(true)}>
                  😎 Knew it <kbd>K</kbd>
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={() => setFlipped(true)}>
                Reveal answer <kbd>Space</kbd>
              </button>
            )}
          </div>
        </>
      ) : (
        <p className="empty">No questions in this track yet.</p>
      )}
    </div>
  );
}
