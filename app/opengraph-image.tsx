import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/seo";

export const runtime = "edge";
export const alt = `${siteConfig.name} · ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(circle at 30% 40%, rgba(59,130,246,0.25), transparent 55%), #000",
          color: "#FAFAFA",
          padding: 80,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 36, color: "#3B82F6" }}>⚡</span>
          <span
            style={{
              fontSize: 22,
              letterSpacing: 6,
              color: "#3B82F6",
              textTransform: "uppercase",
            }}
          >
            ●●●  Inteligência automotiva brasileira
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 132, fontWeight: 600, lineHeight: 1.02 }}>
            Já fipou esse
          </div>
          <div
            style={{
              fontSize: 132,
              fontWeight: 600,
              lineHeight: 1.02,
              color: "#3B82F6",
            }}
          >
            carro?
          </div>
          <div
            style={{ fontSize: 28, color: "#A1A1AA", maxWidth: 900, marginTop: 16 }}
          >
            Preço FIPE · depreciação · recalls · roubo · consumo.
            Antes de você comprar.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#52525B",
            fontFamily: "ui-monospace, monospace",
          }}
        >
          <span>fipou.com.br</span>
          <span>FIPE · Senacon · INMETRO · Susep · BCB</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
