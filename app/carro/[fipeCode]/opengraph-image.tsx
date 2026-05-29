import { ImageResponse } from "next/og";
import { getVehicle } from "@/lib/api/fipe-server";
import { calculateRetention4y, getCurrentPrice } from "@/lib/analytics";
import { FEATURED_FIPE_CODES } from "@/lib/featured";
import { formatBRL, formatNumber } from "@/lib/format";

export const runtime = "nodejs";
export const alt = "Ficha FIPE do veículo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  return FEATURED_FIPE_CODES.map((fipeCode) => ({ fipeCode }));
}

export default async function OG({
  params,
}: {
  params: Promise<{ fipeCode: string }>;
}) {
  const { fipeCode } = await params;
  const vehicle = await getVehicle(fipeCode).catch(() => null);

  if (!vehicle) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#000",
            color: "#FAFAFA",
            fontSize: 64,
          }}
        >
          Veículo não encontrado
        </div>
      ),
      { ...size },
    );
  }

  const currentPrice = getCurrentPrice(vehicle);
  const retention = calculateRetention4y(vehicle);

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
            "radial-gradient(circle at 20% 40%, rgba(59,130,246,0.18), transparent 55%), #000",
          color: "#FAFAFA",
          padding: 72,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 28, color: "#3B82F6" }}>⚡</span>
          <span
            style={{
              fontSize: 18,
              letterSpacing: 5,
              color: "#3B82F6",
              textTransform: "uppercase",
            }}
          >
            ●●●  Ficha completa · fipou.com.br
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 36, color: "#A1A1AA" }}>{vehicle.brand}</div>
          <div
            style={{ fontSize: 64, fontWeight: 600, lineHeight: 1.05, maxWidth: 1050 }}
          >
            {vehicle.model}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 40,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 18, color: "#52525B", letterSpacing: 4 }}>
              VALOR FIPE
            </span>
            <span
              style={{
                fontSize: 96,
                fontWeight: 600,
                color: "#FAFAFA",
                fontFamily: "ui-monospace, monospace",
              }}
            >
              {formatBRL(currentPrice)}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              alignItems: "flex-end",
            }}
          >
            <span style={{ fontSize: 18, color: "#52525B", letterSpacing: 4 }}>
              RETENÇÃO DE VALOR
            </span>
            <span
              style={{
                fontSize: 64,
                color: "#10B981",
                fontFamily: "ui-monospace, monospace",
              }}
            >
              {formatNumber(retention, 1)}%
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
