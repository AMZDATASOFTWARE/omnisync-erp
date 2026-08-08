import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Sparkles } from "lucide-react";
import MessageBubble from "@/components/assistente/MessageBubble";
import WhatsAppConnect from "@/components/assistente/WhatsAppConnect";

const SUGGESTIONS = [
  "Onde está a lâmpada LED?",
  "Qual o preço do cimento?",
  "Quais produtos estão abaixo do estoque mínimo?",
];

export default function Assistente() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    (async () => {
      const conv = await base44.agents.createConversation({
        agent_name: "loja_assistente",
        metadata: { name: "Consulta de loja", description: "Sessão do assistente" },
      });
      setConversation(conv);
    })();
  }, []);

  useEffect(() => {
    if (!conversation?.id) return;
    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });
    return () => unsubscribe();
  }, [conversation?.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || !conversation || sending) return;
    setInput("");
    setSending(true);
    await base44.agents.addMessage(conversation, { role: "user", content });
    setSending(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-0px)] max-h-screen">
      <header className="px-5 md:px-8 py-5 border-b bg-white flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" /> Assistente da Loja
          </h1>
          <p className="text-sm text-muted-foreground">Preço, estoque e localização física — direto do sistema.</p>
        </div>
        <WhatsAppConnect />
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="max-w-md mx-auto text-center space-y-3 pt-10">
            <p className="text-sm text-muted-foreground">Pergunte sobre qualquer produto da loja:</p>
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)}
                className="block w-full rounded-xl border bg-white px-4 py-2.5 text-sm hover:border-emerald-400">
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => <MessageBubble key={i} message={m} />)}
        <div ref={endRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(); }}
        className="border-t bg-white px-4 md:px-8 py-3 flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)}
          placeholder={conversation ? "Digite sua pergunta..." : "Conectando..."}
          disabled={!conversation} className="h-11" />
        <Button type="submit" size="icon" className="h-11 w-11" disabled={!conversation || sending}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}