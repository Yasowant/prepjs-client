import { useEffect, useRef, useState } from "react";
import { api } from "../api.js";
import Markdown from "../components/Markdown.jsx";

const GREETING = {
  role: "assistant",
  content: "Hi! I'm your DevPrep AI coach 🤖 Ask me anything about JavaScript, React, Node.js or interview prep. Try: \"Explain closures with an example\"",
};

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const endRef = useRef(null);

  async function loadConversations(openLatest = false) {
    try {
      const list = await api("/chat/conversations", { auth: true });
      setConversations(list);
      if (openLatest && list.length > 0) openConversation(list[0]._id);
    } catch { /* ignore */ }
  }

  useEffect(() => {
    loadConversations(true);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function openConversation(id) {
    setActiveId(id);
    setSidebarOpen(false);
    try {
      const data = await api(`/chat/conversations/${id}`, { auth: true });
      setMessages([GREETING, ...data.messages]);
    } catch {
      setMessages([GREETING]);
    }
  }

  function newChat() {
    setActiveId(null);
    setMessages([GREETING]);
    setSidebarOpen(false);
  }

  async function deleteConversation(id, e) {
    e.stopPropagation();
    if (!confirm("Delete this chat?")) return;
    await api(`/chat/conversations/${id}`, { method: "DELETE", auth: true }).catch(() => {});
    setConversations((c) => c.filter((x) => x._id !== id));
    if (activeId === id) newChat();
  }

  async function send(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const { reply, conversationId } = await api("/chat", {
        method: "POST",
        auth: true,
        body: {
          messages: next.filter((m) => m !== GREETING),
          conversationId: activeId,
        },
      });
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      if (conversationId !== activeId) {
        setActiveId(conversationId);
        loadConversations(); // new chat appears in sidebar with its title
      } else {
        // bump active conversation to top
        setConversations((c) => {
          const cur = c.find((x) => x._id === activeId);
          if (!cur) return c;
          return [{ ...cur, updatedAt: new Date().toISOString() }, ...c.filter((x) => x._id !== activeId)];
        });
      }
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", content: `⚠️ ${err.message}` }]);
    } finally {
      setBusy(false);
    }
  }

  const suggestions = [
    "Explain the event loop simply",
    "Difference between == and ===?",
    "Write a debounce function",
    "What is prototypal inheritance?",
  ];

  return (
    <div className="chat-layout">
      {/* ===== conversations sidebar ===== */}
      <aside className={`chat-sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="btn btn-outline chat-new" onClick={newChat}>
          ＋ New chat
        </button>
        <div className="chat-conv-list">
          {conversations.length === 0 && (
            <p className="chat-conv-empty">Your chats will appear here.</p>
          )}
          {conversations.map((c) => (
            <button
              key={c._id}
              className={`chat-conv ${activeId === c._id ? "active" : ""}`}
              onClick={() => openConversation(c._id)}
            >
              <span className="chat-conv-icon">💬</span>
              <span className="chat-conv-body">
                <span className="chat-conv-title">{c.title}</span>
                <span className="chat-conv-date">{timeAgo(c.updatedAt)}</span>
              </span>
              <span className="chat-conv-delete" onClick={(e) => deleteConversation(c._id, e)} title="Delete chat">
                🗑
              </span>
            </button>
          ))}
        </div>
        <div className="chat-sidebar-foot">🤖 DevPrep AI Coach</div>
      </aside>

      {/* ===== chat area ===== */}
      <div className="chat-main">
        <div className="chat-topbar">
          <button className="chat-burger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <span className="chat-topbar-title">
            {conversations.find((c) => c._id === activeId)?.title || "New chat"}
          </span>
        </div>

        <div className="chat-window">
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role}`}>
              {m.role === "assistant" && <span className="chat-avatar">🤖</span>}
              <div className="chat-bubble">
                {m.role === "assistant" ? <Markdown text={m.content} /> : m.content}
              </div>
            </div>
          ))}
          {busy && (
            <div className="chat-msg assistant">
              <span className="chat-avatar">🤖</span>
              <div className="chat-bubble typing">Thinking…</div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {messages.length <= 1 && (
          <div className="chat-suggestions">
            {suggestions.map((s) => (
              <button key={s} className="chip small" onClick={() => setInput(s)}>{s}</button>
            ))}
          </div>
        )}

        <form className="chat-input-row" onSubmit={send}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a JavaScript doubt…"
          />
          <button className="btn btn-primary" disabled={busy || !input.trim()}>Send</button>
        </form>
      </div>
    </div>
  );
}
