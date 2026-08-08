import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Check, Loader2, AlertTriangle, ChevronRight } from "lucide-react";

const FAILED = /error|failed/i;

function parseResults(raw) {
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  try { return JSON.parse(raw); } catch { return raw; }
}

const FunctionDisplay = ({ toolCall }) => {
  const [expanded, setExpanded] = useState(false);
  const results = parseResults(toolCall.results);
  const running = ["pending", "running", "in_progress"].includes(toolCall.status);
  const failed =
    ["failed", "error"].includes(toolCall.status) ||
    (typeof toolCall.results === "string" && FAILED.test(toolCall.results)) ||
    (results && results.success === false);

  return (
    <div className="mt-2 text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-muted-foreground hover:text-foreground"
      >
        {running ? <Loader2 className="w-3 h-3 animate-spin" /> : failed ? <AlertTriangle className="w-3 h-3 text-destructive" /> : <Check className="w-3 h-3 text-emerald-600" />}
        <span>{running ? "Consultando" : failed ? "Falhou" : "Consultado"}: {toolCall.name}</span>
        <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
      </button>
      {expanded && (
        <pre className="mt-1 max-h-52 overflow-auto rounded-md bg-muted p-2 text-[11px] whitespace-pre-wrap">
{`Parâmetros: ${toolCall.arguments_string || "{}"}\n\nResultado: ${typeof results === "string" ? results : JSON.stringify(results, null, 2)}`}
        </pre>
      )}
    </div>
  );
};

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${isUser ? "bg-primary text-primary-foreground" : "bg-card border"}`}>
        {message.content && (isUser
          ? <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          : <ReactMarkdown className="text-sm prose prose-sm max-w-none">{message.content}</ReactMarkdown>)}
        {message.tool_calls?.map((tc, i) => <FunctionDisplay key={i} toolCall={tc} />)}
      </div>
    </div>
  );
}