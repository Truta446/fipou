// @ts-nocheck
/**
 * Senacon recall ingestion.
 *
 * Source: Secretaria Nacional do Consumidor (Senacon/MJ) open data,
 * dataset "Recall" on https://dados.mj.gov.br (CKAN).
 *
 * The published CSVs cover ALL consumer products (stoves, toys, cars, …) as
 * free text. This script downloads every yearly CSV, keeps only automotive
 * campaigns (matched by known carmaker names), normalizes them into a compact
 * record keyed by carmaker, and writes lib/enrichment/data/recalls.json.
 *
 * Run with:  node scripts/ingest-recalls.mjs
 *
 * NOTE: the dataset is currently maintained only through ~2017, so it covers
 * older model years. The app layers it UNDER curated data so featured (new)
 * cars still show accurate recall info. Re-run whenever Senacon publishes new
 * years; just add the resource URL below.
 */
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "lib", "enrichment", "data", "recalls.json");

const DATASET =
  "https://dados.mj.gov.br/api/3/action/package_show?id=a194129d-0c0d-4fb1-829b-7ab1c2ef5495";

// Carmaker tokens we recognize → canonical brand used across the app.
const CARMAKERS = {
  toyota: "Toyota",
  honda: "Honda",
  volkswagen: "Volkswagen",
  " vw ": "Volkswagen",
  fiat: "Fiat",
  chevrolet: "Chevrolet",
  "general motors": "Chevrolet",
  " gm ": "Chevrolet",
  hyundai: "Hyundai",
  jeep: "Jeep",
  "fiat chrysler": "Jeep",
  fca: "Jeep",
  ford: "Ford",
  renault: "Renault",
  nissan: "Nissan",
  peugeot: "Peugeot",
  citro: "Citroën",
  "mercedes": "Mercedes-Benz",
  bmw: "BMW",
  audi: "Audi",
  volvo: "Volvo",
  mitsubishi: "Mitsubishi",
  kia: "Kia",
  subaru: "Subaru",
  caoa: "Caoa Chery",
  chery: "Caoa Chery",
  byd: "BYD",
  land: "Land Rover",
  jaguar: "Jaguar",
  porsche: "Porsche",
};

const RISK_SEVERITY = (risco) => {
  const r = (risco || "").toLowerCase();
  if (/inc[êe]ndio|fogo|explos|morte|airbag|frei|dire[çc]/.test(r)) return "alta";
  if (/corte|ferimento|intoxica|envenen|choque|combust/.test(r)) return "média";
  return "baixa";
};

function detectBrand(text) {
  const t = ` ${text.toLowerCase()} `;
  for (const [token, brand] of Object.entries(CARMAKERS)) {
    if (t.includes(token)) return brand;
  }
  return null;
}

function parseCsv(text) {
  // Senacon CSVs are ';'-separated, latin-1 already decoded to utf-8 by caller.
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const header = lines.shift().split(";");
  const idx = (name) => header.findIndex((h) => h.trim() === name);
  const iStart = idx("data_inicio");
  const iTitulo = idx("titulo");
  const iForn = idx("fornecedor");
  const iRisco = idx("tipo_risco");
  const iProduto = idx("produto");
  return lines.map((line) => {
    const c = line.split(";");
    return {
      date: c[iStart]?.trim() ?? "",
      titulo: c[iTitulo]?.trim() ?? "",
      fornecedor: c[iForn]?.trim() ?? "",
      risco: c[iRisco]?.trim() ?? "",
      produto: c[iProduto]?.trim() ?? "",
    };
  });
}

function toIsoDate(br) {
  // "29/05/2017" → "2017-05-29"
  const m = br.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : br;
}

async function fetchText(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  // CSVs are latin-1 (ISO-8859-1).
  return new TextDecoder("latin1").decode(buf);
}

async function main() {
  console.log("Fetching Senacon dataset metadata…");
  const meta = await fetch(DATASET).then((r) => r.json());
  const csvResources = meta.result.resources.filter(
    (r) => (r.format || "").toUpperCase() === "CSV",
  );
  console.log(`Found ${csvResources.length} CSV resources.`);

  const byBrand = {};
  let totalVehicle = 0;

  for (const res of csvResources) {
    try {
      const text = await fetchText(res.url);
      const rows = parseCsv(text);
      for (const row of rows) {
        const haystack = `${row.fornecedor} ${row.titulo} ${row.produto}`;
        const brand = detectBrand(haystack);
        if (!brand) continue;
        totalVehicle++;
        const summary = (row.titulo || row.produto || "Recall").slice(0, 120);
        const entry = {
          date: toIsoDate(row.date),
          summary,
          severity: RISK_SEVERITY(row.risco),
          // tokens from the product/title, lowercased, for fuzzy model matching
          modelTokens: `${row.titulo} ${row.produto}`
            .toLowerCase()
            .replace(/[^a-zà-ú0-9\s]/g, " ")
            .split(/\s+/)
            .filter((w) => w.length >= 3),
        };
        (byBrand[brand] ??= []).push(entry);
      }
      console.log(`  ${res.name}: ok`);
    } catch (err) {
      console.warn(`  ${res.name}: FAILED (${err.message}) — skipping`);
    }
  }

  // Sort each brand's recalls newest-first and de-dup identical summaries.
  for (const brand of Object.keys(byBrand)) {
    const seen = new Set();
    byBrand[brand] = byBrand[brand]
      .filter((r) => {
        const k = `${r.date}|${r.summary}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  const out = {
    source: "Senacon/MJ — dados.mj.gov.br (dataset Recall)",
    generatedFrom: csvResources.map((r) => r.name),
    note: "Cobertura oficial 2013–2017. Layered under curated data for recent models.",
    brands: byBrand,
  };

  await writeFile(OUT, JSON.stringify(out, null, 2), "utf-8");
  console.log(
    `\nWrote ${OUT}\n  ${totalVehicle} vehicle recalls across ${Object.keys(byBrand).length} brands.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
