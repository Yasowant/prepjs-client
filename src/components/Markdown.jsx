// Tiny markdown renderer for chat messages — no dependencies.
// Supports: ```code blocks```, `inline code`, **bold**, headings (###),
// numbered/bullet lists and paragraphs.

function InlineText({ text }) {
  // tokenize `code` and **bold**
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`"))
      return <code className="md-inline-code" key={i}>{part.slice(1, -1)}</code>;
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    return <span key={i}>{part}</span>;
  });
}

function TextBlock({ text }) {
  const lines = text.split("\n");
  const blocks = [];
  let list = null; // { ordered, items }

  const flushList = () => {
    if (list) { blocks.push(list); list = null; }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-*•]\s+(.*)/);
    const numbered = line.match(/^\s*(\d+)[.)]\s+(.*)/);
    const heading = line.match(/^\s*#{1,4}\s+(.*)/);

    if (bullet) {
      if (!list || list.ordered) { flushList(); list = { ordered: false, items: [] }; }
      list.items.push(bullet[1]);
    } else if (numbered) {
      if (!list || !list.ordered) { flushList(); list = { ordered: true, items: [] }; }
      list.items.push(numbered[2]);
    } else if (heading) {
      flushList();
      blocks.push({ heading: heading[1] });
    } else if (line.trim() === "") {
      flushList();
    } else {
      flushList();
      blocks.push({ p: line });
    }
  }
  flushList();

  return blocks.map((b, i) => {
    if (b.heading) return <p className="md-heading" key={i}><InlineText text={b.heading} /></p>;
    if (b.items) {
      const Tag = b.ordered ? "ol" : "ul";
      return (
        <Tag className="md-list" key={i}>
          {b.items.map((item, j) => <li key={j}><InlineText text={item} /></li>)}
        </Tag>
      );
    }
    return <p className="md-p" key={i}><InlineText text={b.p} /></p>;
  });
}

export default function Markdown({ text }) {
  // split on fenced code blocks
  const segments = text.split(/```(\w*)\n?([\s\S]*?)```/g);
  const out = [];
  for (let i = 0; i < segments.length; i += 3) {
    const plain = segments[i];
    if (plain && plain.trim()) out.push(<TextBlock text={plain} key={`t${i}`} />);
    if (i + 2 < segments.length) {
      const lang = segments[i + 1];
      const code = segments[i + 2];
      out.push(
        <pre className="md-code" key={`c${i}`}>
          {lang && <span className="md-code-lang">{lang}</span>}
          <code>{code.replace(/\n$/, "")}</code>
        </pre>
      );
    }
  }
  return <div className="md">{out}</div>;
}
