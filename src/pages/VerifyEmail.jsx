import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api.js";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState({ status: "loading", message: "Verifying your email…" });

  useEffect(() => {
    if (!token) {
      setState({ status: "error", message: "No verification token found in the link." });
      return;
    }
    api("/auth/verify-email", { method: "POST", body: { token } })
      .then((d) => setState({ status: "ok", message: d.message }))
      .catch((e) => setState({ status: "error", message: e.message }));
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "3rem" }}>
          {state.status === "loading" ? "⏳" : state.status === "ok" ? "🎉" : "😕"}
        </div>
        <h2>
          {state.status === "loading" ? "Verifying…" : state.status === "ok" ? "Email verified!" : "Verification failed"}
        </h2>
        <p className="auth-sub" style={{ marginTop: 0 }}>{state.message}</p>
        {state.status === "ok" && (
          <Link to="/login" className="btn btn-primary">Log in now</Link>
        )}
        {state.status === "error" && (
          <Link to="/login" className="btn btn-outline">Back to login</Link>
        )}
      </div>
    </div>
  );
}
