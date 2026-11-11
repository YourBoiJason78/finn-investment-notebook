# FINN Implementation Plan

> For agentic workers: use executing-plans for inline implementation and an independent final reviewer. Steps use checkbox tracking.

Goal: deliver a distinctive, source-grounded working FINN prototype and understandable source repository.
Architecture: one browser app, one portable Worker API, Python snapshot ingestion.
Tech stack: HTML/CSS/JavaScript, Node built-in test runner, Python requests/pypdf, unpdf PDF extraction, esbuild bundling.
Spec: docs/design.md

## Global Constraints
18 mixed-sector mock holdings; three verified research examples. Pull evidence is annual reports and earnings-call transcripts. Sources, periods, retrieval failures and extractive/model modes must be explicit. No secrets in frontend or repository. Responsive at 390px. Saved questions are device-local.

## Review Focus
Unknown symbol must not receive another company's cached research.
Failed refresh must preserve dated data without claiming it is live.
Price/volume calculations must ignore incomplete or zero-base observations.
Untrusted company text must not become HTML or model instructions.
Watch matches must remain suggestions for review, not automatic verdicts.

## Task 1: deterministic engine and source collection
Files: server/core.mjs, tests/core.test.mjs, python/collect.py, data/bootstrap.json.
Interfaces: normalizeSymbol(value), summarizePrices(chart), classifyEvent(record), filterEvents(events, options), extractDocumentLinks(html, baseUrl), retrievePassages(pages,question).
- [ ] Write and run failing behavior tests for invalid symbols, zero volumes, rolling average excluding latest day, date filters, classification and HTML document discovery.
- [ ] Implement engine and Python collector; gather real source snapshots and record failures.
- [ ] Run node --test tests/core.test.mjs; expect all pass.

## Task 2: portable API and source research
Files: server/app.mjs, server/research.mjs, server/live.mjs, scripts/dev.mjs, scripts/build.mjs, tests/api.test.mjs, data/research/*.json.
Interfaces: createApp({assets,bootstrap,researchPacks}) returns {fetch(request,env,ctx)}. Implements endpoints in design.md.
- [ ] Test invalid input, unknown ticker behavior, no configured model mode, citation validation and cache isolation; observe failures.
- [ ] Implement bounded fetching, primary PDF discovery/extraction, source passage retrieval, optional configurable model, and API routing.
- [ ] Run node --test; expect pass. Verify real new ticker and source error behavior.

## Task 3: product interface
Files: web/index.html, web/styles.css, web/app.js.
- [ ] Implement Brief/Research/Watching, configurable thresholds, source evidence sheet, device-local persistence and honest modes.
- [ ] Use APIs from Task 2. Test core interactions at phone and desktop widths, including empty and failure states.

## Task 4: verification and delivery
Files: README.md, docs/decisions.md, docs/demo.md, docs/ai-history.md, deployment files and outputs bundle.
- [ ] Run full test suite, build, inspect mobile/desktop, and get independent review.
- [ ] Fix material review findings with reproducing tests and rerun suite.
- [ ] Commit, synchronize exact source, deploy privately and verify returned deployment state.
- [ ] Deliver URL and zipped source plus clear setup limits. Never submit an email or invent a GitHub repository.
