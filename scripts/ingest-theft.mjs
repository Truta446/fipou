// @ts-nocheck
/**
 * Susep / SSP vehicle theft-ranking ingestion (documented pipeline).
 *
 * Official sources:
 *   - Susep AUTOSEG (estatísticas de automóvel): https://www2.susep.gov.br/
 *     menuestatistica/Autoseg/principal.aspx  (per-model claims incl. roubo/furto)
 *   - State public-security secretariats (e.g. SSP-SP "veículos mais roubados").
 *
 * Both publish aggregate spreadsheets, not a clean API. This script is where the
 * parser goes once an environment can reach AUTOSEG. The committed
 * lib/enrichment/data/theft.json holds a structured ranking snapshot keyed by
 * brand → model word + state, so the app runs with zero runtime gov dependency.
 *
 * TODO when automating:
 *   1. Pull the latest AUTOSEG base (roubo+furto frequency per model/region).
 *   2. Rank models within each state by claims frequency.
 *   3. Keep top ~30 per state → { brand, model, state, rank }.
 *   4. Write lib/enrichment/data/theft.json in the existing shape.
 *
 * Run with:  node scripts/ingest-theft.mjs
 */
console.log(
  [
    "Susep/SSP theft-ranking ingestion",
    "----------------------------------",
    "Source publishes aggregate spreadsheets (AUTOSEG), not a REST API.",
    "Current data: lib/enrichment/data/theft.json (curated ranking snapshot).",
    "Wire the AUTOSEG parser here to fully automate. See file header.",
  ].join("\n"),
);
