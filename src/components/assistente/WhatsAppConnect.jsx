import React from "react";
import { base44 } from "@/api/base44Client";
import { MessageCircle } from "lucide-react";

export default function WhatsAppConnect({ agentName = "loja_assistente" }) {
  return (
    <a
      href={base44.agents.getWhatsAppConnectURL(agentName)}
      target="_blank"
      rel="noopener noreferrer"
      className="brand-btn-secondary shrink-0"
    >
      <MessageCircle className="w-4 h-4" strokeWidth={2} />
      Conectar no WhatsApp
    </a>
  );
}