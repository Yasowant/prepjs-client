import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";

const W = 1200;
const H = 850;

function drawCertificate(canvas, { name, trackName, total, date, certId }) {
  const ctx = canvas.getContext("2d");

  // background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0b1020");
  bg.addColorStop(1, "#131c38");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // subtle glow
  const glow = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 620);
  glow.addColorStop(0, "rgba(56, 189, 248, 0.10)");
  glow.addColorStop(1, "rgba(56, 189, 248, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // double border
  ctx.strokeStyle = "#facc15";
  ctx.lineWidth = 3;
  ctx.strokeRect(36, 36, W - 72, H - 72);
  ctx.strokeStyle = "rgba(56, 189, 248, 0.55)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(50, 50, W - 100, H - 100);

  // corner accents
  ctx.fillStyle = "#facc15";
  const corner = (x, y, dx, dy) => {
    ctx.fillRect(x, y, 34 * dx, 4 * dy);
    ctx.fillRect(x, y, 4 * dx, 34 * dy);
  };
  corner(36, 36, 1, 1);
  corner(W - 36, 36, -1, 1);
  corner(36, H - 36, 1, -1);
  corner(W - 36, H - 36, -1, -1);

  ctx.textAlign = "center";

  // brand
  ctx.fillStyle = "#facc15";
  ctx.font = "700 30px Nunito, sans-serif";
  ctx.fillText("⚛ DevPrep", W / 2, 128);

  ctx.fillStyle = "#8b98b8";
  ctx.font = "600 17px Nunito, sans-serif";
  ctx.letterSpacing = "6px";
  ctx.fillText("C E R T I F I C A T E   O F   C O M P L E T I O N", W / 2, 186);
  ctx.letterSpacing = "0px";

  ctx.fillStyle = "#8b98b8";
  ctx.font = "400 20px Nunito, sans-serif";
  ctx.fillText("This certifies that", W / 2, 268);

  // learner name
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 58px Nunito, sans-serif";
  ctx.fillText(name, W / 2, 348);

  // underline
  ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
  ctx.lineWidth = 2;
  const nameW = Math.min(ctx.measureText(name).width, 700);
  ctx.beginPath();
  ctx.moveTo(W / 2 - nameW / 2 - 20, 372);
  ctx.lineTo(W / 2 + nameW / 2 + 20, 372);
  ctx.stroke();

  ctx.fillStyle = "#8b98b8";
  ctx.font = "400 20px Nunito, sans-serif";
  ctx.fillText("has successfully completed the", W / 2, 432);

  // track
  ctx.fillStyle = "#38bdf8";
  ctx.font = "700 42px Nunito, sans-serif";
  ctx.fillText(`${trackName} Track`, W / 2, 492);

  ctx.fillStyle = "#8b98b8";
  ctx.font = "400 19px Nunito, sans-serif";
  ctx.fillText(
    `${total} concepts mastered · explanations, code examples & interview questions`,
    W / 2,
    540
  );

  // footer row
  ctx.textAlign = "left";
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "600 18px Nunito, sans-serif";
  ctx.fillText(date, 110, H - 130);
  ctx.fillStyle = "#8b98b8";
  ctx.font = "400 14px Nunito, sans-serif";
  ctx.fillText("Date of completion", 110, H - 105);

  ctx.textAlign = "right";
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "600 18px Nunito, sans-serif";
  ctx.fillText("Yasowant Nayak", W - 110, H - 130);
  ctx.fillStyle = "#8b98b8";
  ctx.font = "400 14px Nunito, sans-serif";
  ctx.fillText("Creator, DevPrep", W - 110, H - 105);

  ctx.textAlign = "center";
  ctx.fillStyle = "#4a5568";
  ctx.font = "400 13px Nunito, sans-serif";
  ctx.fillText(`Certificate ID: ${certId} · devprep.esscentra.in`, W / 2, H - 70);
}

export default function Certificate() {
  const { track } = useParams();
  const canvasRef = useRef(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/gamify/certificates", { auth: true }).then(setData).catch((e) => setError(e.message));
  }, []);

  const t = data?.tracks.find((x) => x.id === track);

  useEffect(() => {
    if (!t?.earned || !canvasRef.current) return;
    // ensure the font is loaded before drawing
    const draw = () =>
      drawCertificate(canvasRef.current, {
        name: data.name,
        trackName: t.name.replace(" Mastery", ""),
        total: t.total,
        date: new Date(t.earnedAt).toLocaleDateString("en-IN", {
          day: "numeric", month: "long", year: "numeric",
        }),
        certId: `DP-${track.toUpperCase()}-${new Date(t.earnedAt).getTime().toString(36).toUpperCase()}`,
      });
    if (document.fonts?.ready) document.fonts.ready.then(draw);
    else draw();
  }, [data, t, track]);

  function download() {
    const a = document.createElement("a");
    a.download = `devprep-${track}-certificate.png`;
    a.href = canvasRef.current.toDataURL("image/png");
    a.click();
  }

  if (error) return <div className="page"><p className="empty">{error}</p></div>;
  if (!data) return <div className="page-loader">Checking your progress…</div>;
  if (!t) return <div className="page"><p className="empty">Unknown track.</p></div>;

  if (!t.earned) {
    return (
      <div className="page cert-page">
        <h1>🎓 {t.name} Certificate</h1>
        <p className="page-sub">
          Complete all {t.total} concepts in this track to earn your certificate.
          Mark each concept ✓ Completed as you finish reading it.
        </p>

        {/* overall */}
        <div className="cert-overall">
          <div className="iv-score-ring" style={{ "--pct": t.percent }}>
            <span>{t.percent}<small>%</small></span>
          </div>
          <div className="cert-overall-body">
            <strong>{t.completed} of {t.total} concepts completed</strong>
            <span>{t.total - t.completed} to go — you're closer than you think 💪</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${t.percent}%` }} />
            </div>
          </div>
        </div>

        {/* per-category breakdown */}
        <h2 className="iv-h2">📊 Progress by category</h2>
        <div className="cert-cats">
          {t.byCategory.map((c) => {
            const pct = c.total ? Math.round((c.completed / c.total) * 100) : 0;
            return (
              <Link to={`/concepts?category=${c.id}`} className="cert-cat-row" key={c.id}>
                <span className="cert-cat-icon">{c.icon}</span>
                <div className="cert-cat-mid">
                  <div className="cert-cat-top">
                    <span>{c.name}</span>
                    <span className={pct === 100 ? "cert-cat-done" : ""}>
                      {pct === 100 ? "✅" : ""} {c.completed}/{c.total}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-fill ${pct === 100 ? "full" : ""}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* exactly what's left */}
        {t.remaining.length > 0 && (
          <>
            <h2 className="iv-h2">📝 Remaining concepts ({t.remaining.length}) — click to read</h2>
            <div className="cert-remaining">
              {t.remaining.map((c) => (
                <Link to={`/concepts/${c.id}`} className="cert-remaining-chip" key={c.id}>
                  {c.title}
                </Link>
              ))}
            </div>
          </>
        )}

        <div className="iv-actions" style={{ marginTop: 24 }}>
          <Link to="/concepts" className="btn btn-primary">Continue learning →</Link>
          <Link to="/dashboard" className="btn btn-outline">← Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page cert-page">
      <h1>🎓 Your certificate</h1>
      <p className="page-sub">
        Earned by completing all {t.total} concepts in the {t.name.replace(" Mastery", "")} track.
        Download it and add it to your LinkedIn — tag it with your DevPrep profile!
      </p>
      <canvas ref={canvasRef} width={W} height={H} className="cert-canvas" />
      <div className="iv-actions">
        <button className="btn btn-primary" onClick={download}>⬇️ Download PNG</button>
        <a
          className="btn btn-outline"
          href="https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fdevprep.esscentra.in"
          target="_blank"
          rel="noreferrer"
        >
          💼 Share on LinkedIn
        </a>
        <Link to="/dashboard" className="btn btn-ghost">← Dashboard</Link>
      </div>
      <p className="cert-hint">
        Tip: on LinkedIn choose "Add profile section → Licenses & certifications" and upload the image.
      </p>
    </div>
  );
}
