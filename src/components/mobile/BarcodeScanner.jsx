import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let stream, raf, stopped = false;
    const Detector = window.BarcodeDetector;

    const start = async () => {
      if (!Detector) { setError("Este dispositivo não suporta leitura de código pela câmera."); return; }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      } catch {
        setError("Não foi possível acessar a câmera.");
        return;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      const detector = new Detector();
      const tick = async () => {
        if (stopped || !videoRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes && codes.length) { onDetected(codes[0].rawValue); return; }
        } catch { /* frame não pronto */ }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    start();

    return () => {
      stopped = true;
      if (raf) cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <button onClick={onClose} className="absolute top-4 right-4 z-10 h-12 w-12 rounded-full bg-white/15 text-white flex items-center justify-center">
        <X className="w-6 h-6" />
      </button>
      <video ref={videoRef} playsInline muted className="flex-1 w-full object-cover" />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-64 h-40 border-2 border-emerald-400 rounded-2xl" />
      </div>
      <p className="absolute bottom-8 inset-x-0 text-center text-white/80 text-sm px-6">
        {error || "Aponte a câmera para o código de barras"}
      </p>
    </div>
  );
}