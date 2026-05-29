// @ts-nocheck
/**
 * One-shot catalog harvest for the sitemap.
 *
 * Crawls a curated set of popular Brazilian brands, dedupes each brand's
 * models down to one representative per model family, resolves the FIPE code
 * via the most recent model year, and writes lib/catalog/vehicles-index.json.
 *
 * Run ONCE:  node scripts/harvest-catalog.mjs
 * The output JSON is committed; the sitemap reads it with zero build-time calls.
 *
 * Rate limits respected (per IP/day): list endpoints 1000, price/detail 500.
 * A hard MAX_DETAIL guard keeps us safely under the detail budget.
 */
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "lib", "catalog", "vehicles-index.json");

const BASE = "https://fipe.parallelum.com.br/api/v2/cars";

// Popular Brazilian carmakers (FIPE brand codes).
const BRANDS = [
  { code: "56", name: "Toyota" },
  { code: "25", name: "Honda" },
  { code: "59", name: "VW - VolksWagen" },
  { code: "23", name: "GM - Chevrolet" },
  { code: "21", name: "Fiat" },
  { code: "29", name: "Jeep" },
  { code: "26", name: "Hyundai" },
  { code: "22", name: "Ford" },
  { code: "48", name: "Renault" },
  { code: "43", name: "Nissan" },
  { code: "44", name: "Peugeot" },
  { code: "13", name: "Citroën" },
  { code: "41", name: "Mitsubishi" },
  { code: "31", name: "Kia Motors" },
  { code: "238", name: "BYD" },
  { code: "55", name: "Suzuki" },
  { code: "240", name: "GWM" },
  { code: "245", name: "Caoa Chery" },
  { code: "7", name: "BMW" },
  { code: "39", name: "Mercedes-Benz" },
  { code: "6", name: "Audi" },
  { code: "33", name: "Land Rover" },
];

const TARGET = 350;
const MAX_DETAIL = 480; // hard safety cap under the 500/day detail limit
const FAMILIES_PER_BRAND = 18;
const DELAY_MS = 40;

let detailCalls = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

/** First meaningful token of a model name → its "family". */
function family(name) {
  return name
    .toLowerCase()
    .replace(/[^a-zà-ú0-9\s-]/g, " ")
    .trim()
    .split(/\s+/)[0];
}

function pickRecentYear(years) {
  const real = years.filter((y) => !String(y.code).startsWith("32000"));
  for (const pref of ["2024", "2025", "2023", "2022"]) {
    const hit = real.find((y) => String(y.code).startsWith(pref));
    if (hit) return hit.code;
  }
  return real[0]?.code ?? null;
}

async function main() {
  const index = [];
  const seenFipe = new Set();

  for (const brand of BRANDS) {
    if (index.length >= TARGET || detailCalls >= MAX_DETAIL) break;
    let models;
    try {
      models = await getJson(`${BASE}/brands/${brand.code}/models`);
    } catch {
      console.warn(`  ${brand.name}: models FAILED — skipping`);
      continue;
    }

    // One representative model per family (prefer the highest code = newer trim).
    const byFamily = new Map();
    for (const m of models) {
      const f = family(m.name);
      const prev = byFamily.get(f);
      if (!prev || Number(m.code) > Number(prev.code)) byFamily.set(f, m);
    }
    const reps = [...byFamily.values()].slice(0, FAMILIES_PER_BRAND);

    let brandCount = 0;
    for (const m of reps) {
      if (index.length >= TARGET || detailCalls >= MAX_DETAIL) break;
      try {
        const years = await getJson(
          `${BASE}/brands/${brand.code}/models/${m.code}/years`,
        );
        const yearCode = pickRecentYear(years);
        if (!yearCode) continue;

        detailCalls++;
        const detail = await getJson(
          `${BASE}/brands/${brand.code}/models/${m.code}/years/${yearCode}`,
        );
        await sleep(DELAY_MS);

        const fipeCode = detail.codeFipe;
        if (!fipeCode || seenFipe.has(fipeCode)) continue;
        seenFipe.add(fipeCode);
        index.push({
          fipeCode,
          brand: detail.brand,
          model: detail.model,
          modelYear: detail.modelYear,
        });
        brandCount++;
      } catch {
        /* skip this model */
      }
    }
    console.log(
      `  ${brand.name}: +${brandCount} (total ${index.length}, detail calls ${detailCalls})`,
    );
  }

  index.sort((a, b) =>
    `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`, "pt-BR"),
  );

  const out = {
    source: "fipe.parallelum.com.br/api/v2 (harvest único)",
    count: index.length,
    detailCalls,
    vehicles: index,
  };
  await writeFile(OUT, JSON.stringify(out, null, 2), "utf-8");
  console.log(
    `\nWrote ${OUT}\n  ${index.length} veículos · ${detailCalls} chamadas de detalhe usadas.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
