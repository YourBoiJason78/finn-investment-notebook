# FINN — The investment notebook

FINN helps an investor decide what deserves a closer look, inspect the original evidence, and remember the questions that remain open.

The central example is deliberately awkward: Infosys delivered 4.2% constant-currency growth in FY2025. That exceeded its original 1–3% outlook, but missed January's 4.5–5% revision. Switching guidance versions changes the verdict while preserving the same reported outcome. FINN makes that context visible.

## Run locally

Requires Node.js 22 or newer and pnpm. From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://127.0.0.1:5173. The dated snapshot and verified cases work without API keys. Internet access is needed for refreshes and new-company research.

```sh
pnpm test
pnpm build
```

The build produces a portable Worker at `dist/server/index.js`, with the interface and dated snapshot embedded. The server has no database dependency.

## What to try

1. Open **The brief**, widen the time window and inspect a filing. Tune price and volume thresholds in Preferences.
2. Open **Research → INFY**. Switch Original/Revised, then Growth/Margin. Inspect the primary documents behind each comparison.
3. Compare HCLTECH's measurable guidance with TCS's less measurable AI ambition. FINN leaves the latter unscored.
4. Enter WIPRO or another NSE symbol. FINN discovers annual reports and earnings-call transcripts, reads bounded portions, and reports gaps.
5. Ask a focused question, inspect matching passages, and save an open question. **Watching** checks for newer filings on demand and when opened.

## AI connection

The optional server adapter supports Google's Gemini `generateContent` API. Set both `GEMINI_API_KEY` and `GEMINI_MODEL` to enable generated answers. Choose a model currently available to your account. For local development, copy `.env.example` to `.env`, fill it privately, and run:

```sh
node --env-file=.env scripts/dev.mjs
```

On the hosted site, those values are configured as server environment variables, with the API key stored as a secret. The connected model is `gemini-3.5-flash-lite`. No credentials are included in this repository or source ZIP. Never put a key in `web/`, a Git commit, or a chat message. Local copies need their own configuration; without it, the app explicitly returns matching primary-source excerpts. Prepared FY2025 comparisons are curated evidence, not simulated model runs.

The adapter restricts the prompt to retrieved evidence, validates citation IDs, and retains the cited PDF page. It does not prove that every generated claim is entailed by its citation. Deterministic provider mocks test the contract. Live Gemini checks on 14 November 2026 covered the Infosys guidance comparison and a WIPRO operating-margin question; these checks are examples, not a comprehensive factual-reliability evaluation.

## Data and boundaries

- 18 mock NSE holdings across sectors, with dated Yahoo Finance end-of-day price observations and NSE announcements. These are not the user's actual investments.
- Three curated historical research packs: Infosys, HCLTech and TCS, for FY2025. Primary-source links are included in the research cases.
- Screener is used to discover document links; its commentary and financial tables are not used as research evidence. Only allowed company/exchange PDF hosts are read. Unsupported hosts are reported as unavailable.
- Annual reports are bounded to the first 15 and last 25 pages; transcripts to the first 60. Long-report gaps, fetch failures and unknown outcomes are explicit. Scanned PDFs may yield no usable text.
- The in-app brief is the proactive/push-style surface. There are **no background notifications**, scheduled jobs or email delivery. Watches are open questions, not automated thesis verdicts.
- Questions and thresholds stay in browser storage. Checks and server caches are temporary; no account sync is implemented. Different browser/device means a separate notebook.
- Live feeds may block hosted requests. A failed refresh retains the last observation and its date. Exchange results cover the feed returned, not a guaranteed exhaustive archive.
- PP Neue Montreal is selected as the preferred local font. Proprietary font files are not bundled; Arial is the fallback until a licensed webfont is provided.

## How the code fits together

See the [implementation summary](docs/implementation-summary.md) for architecture, trade-offs and development context.

| Path | Responsibility |
| --- | --- |
| `web/` | Responsive interface, comparison controls and device-local notebook |
| `server/core.mjs` | Symbols, completed-session prices, event classification, document discovery and passage ranking |
| `server/research.mjs` | Bounded PDF reads, page-level evidence and optional model synthesis |
| `server/live.mjs` | Price/announcement refresh with dated fallbacks |
| `server/app.mjs` | HTTP routes, validation and temporary caches |
| `python/collect.py` | Reproducible collection of the bundled market snapshot |
| `data/research/` | Curated, dated research cases |
| `tests/` | Calculations, API validation, PDF extraction and review regressions |

To regenerate a snapshot, install Python's `requests`, run `python python/collect.py`, inspect the success counts, then run `node scripts/prepare-data.mjs`. Preparation uses the snapshot's observation time to avoid relabeling an incomplete session as EOD when reprocessed later.

## Delivery status

This is a working prototype, with explicit scope limits. The hosted site and GitHub repository are public. Gemini synthesis is connected; free-tier availability and quotas still apply. Submission materials and the conversation export are maintained separately from this repository.
