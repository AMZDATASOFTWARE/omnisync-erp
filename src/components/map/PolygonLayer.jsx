import React from "react";

// Renderiza os polígonos vetoriais das zonas (coordenadas normalizadas 0..1)
export default function PolygonLayer({ zones, W, H, highlightZoneId, draftPoints, draftColor }) {
  const pts = (poly) => poly.map((p) => `${p.x * W},${p.y * H}`).join(" ");

  return (
    <g pointerEvents="none">
      {zones.map((z) =>
        z.polygon?.length > 2 ? (
          <polygon key={z.id} points={pts(z.polygon)} fill={z.color} fillOpacity="0.35"
            stroke={highlightZoneId === z.id ? "#1FD5F9" : z.color}
            strokeWidth={highlightZoneId === z.id ? 3 : 1.5} />
        ) : null
      )}

      {draftPoints?.length > 0 && (
        <g>
          <polyline points={pts(draftPoints)} fill="none" stroke={draftColor || "#1FD5F9"}
            strokeWidth="2" strokeDasharray="6 4" />
          {draftPoints.map((p, i) => (
            <circle key={i} cx={p.x * W} cy={p.y * H} r="4" fill="#1FD5F9" stroke="#050B15" strokeWidth="1.5" />
          ))}
        </g>
      )}
    </g>
  );
}