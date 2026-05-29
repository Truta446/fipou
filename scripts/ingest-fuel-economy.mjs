// @ts-nocheck
/**
 * INMETRO PBE Veicular fuel-economy ingestion (documented pipeline).
 *
 * Official source: Programa Brasileiro de Etiquetagem Veicular (PBE Veicular),
 * INMETRO. The yearly tables are published as ODS/PDF at:
 *   https://www.gov.br/inmetro/pt-br/assuntos/avaliacao-da-conformidade/
 *     programa-brasileiro-de-etiquetagem/tabelas-de-consumo-eficiencia-energetica
 *
 * Because INMETRO ships spreadsheets/PDFs (not a clean CSV API), this script is
 * the place to wire the parser when an environment can reach those files. The
 * committed lib/enrichment/data/fuel-economy.json is a structured snapshot of
 * representative PBE figures, keyed by brand → model word, so the app works
 * offline and on the Vercel free tier with zero runtime gov dependency.
 *
 * TODO when automating:
 *   1. Download the latest PBE Veicular ODS for the target year.
 *   2. Parse rows → { brand, model, etanolCidade, etanolEstrada, gasCidade, gasEstrada }.
 *   3. Reduce to one representative km/l per model word (median across trims).
 *   4. Write lib/enrichment/data/fuel-economy.json in the existing shape.
 *
 * Run with:  node scripts/ingest-fuel-economy.mjs
 */
console.log(
  [
    "INMETRO PBE Veicular ingestion",
    "-------------------------------",
    "Source publishes ODS/PDF, not a REST/CSV API.",
    "Current data: lib/enrichment/data/fuel-economy.json (curated PBE snapshot).",
    "Wire the spreadsheet parser here to fully automate. See file header.",
  ].join("\n"),
);
