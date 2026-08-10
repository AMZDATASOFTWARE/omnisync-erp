import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { ImagePlus, Loader2, X } from "lucide-react";

export default function ProductImageField({ value, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const pick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onChange(file_url);
    setUploading(false);
    e.target.value = "";
  };

  return (
    <div className="flex items-center gap-3">
      {value ? (
        <div className="relative">
          <Image src={value} alt="Foto do produto" className="w-20 h-20 rounded-lg border border-slate-200 object-cover" />
          <button type="button" onClick={() => onChange("")}
            className="absolute -top-2 -right-2 bg-white border border-slate-200 rounded-full p-0.5 text-slate-500 hover:text-rose-600 shadow-sm">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="w-20 h-20 rounded-lg border border-dashed border-slate-300 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-emerald-400 hover:text-emerald-600 text-[11px]">
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ImagePlus className="w-5 h-5" />Foto</>}
        </button>
      )}
      {value && (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="text-xs text-emerald-600 hover:underline">
          {uploading ? "Enviando…" : "Trocar foto"}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={pick} />
    </div>
  );
}