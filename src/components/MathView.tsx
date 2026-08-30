import React, { useMemo } from "react";
import katex from "katex";

interface MathViewProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({ math, block = false, className = "" }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
        output: "htmlAndMathml",
      });
    } catch (e) {
      console.warn("KaTeX render error for:", math, e);
      return `<span>${math}</span>`;
    }
  }, [math, block]);

  return (
    <span
      className={`inline-block font-serif ${block ? "my-2 overflow-x-auto text-center" : ""} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export const FormattedMathText: React.FC<{ text: string; className?: string }> = ({ text, className = "" }) => {
  // Parse $...$ (inline) and $$...$$ (block)
  const parts = useMemo(() => {
    const regex = /(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g;
    const tokens: { type: "text" | "inline-math" | "block-math"; value: string }[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({ type: "text", value: text.substring(lastIndex, match.index) });
      }
      const raw = match[0];
      if (raw.startsWith("$$") && raw.endsWith("$$")) {
        tokens.push({ type: "block-math", value: raw.slice(2, -2).trim() });
      } else if (raw.startsWith("$") && raw.endsWith("$")) {
        tokens.push({ type: "inline-math", value: raw.slice(1, -1).trim() });
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      tokens.push({ type: "text", value: text.substring(lastIndex) });
    }

    return tokens;
  }, [text]);

  return (
    <div className={`leading-relaxed whitespace-pre-wrap ${className}`}>
      {parts.map((p, i) => {
        if (p.type === "block-math") {
          return <MathView key={i} math={p.value} block={true} />;
        }
        if (p.type === "inline-math") {
          return <MathView key={i} math={p.value} block={false} />;
        }
        return <span key={i}>{p.value}</span>;
      })}
    </div>
  );
};
