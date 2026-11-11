# FINN — an investment notebook that remembers

Build a working mobile-first investment intelligence prototype for the ENAM challenge. The user knows C++ and some Python, has two hours per day, and explicitly delegated design and implementation choices. The priority is a distinctive, understandable product with real source evidence.

## Product
Three views: Brief, Research, Watching. Brief ranks portfolio filings, collapses routine notices, supports a date window and configurable EOD move/volume thresholds. Research accepts arbitrary NSE symbols, discovers primary reports and transcripts, and presents cited findings. Watching stores user questions locally and checks for relevant newer evidence when opened/refreshed. No claim of background notifications while the app is closed.

Design: warm off-white paper, ink typography, forest-green accents, restrained rust for caution, generous mobile touch targets. Editorial but compact. Evidence opens in an accessible side sheet (full screen on phones). Actual sources and dates are always visible. Use no stock photography.

## Scope and truthfulness
- 18 mixed-sector mock holdings; three verified research examples.
- Prices are end-of-day, announcements are exchange primary records.
- Pull analysis uses annual reports and earnings-call transcripts only. Links discovered through Screener are discovery metadata, not research evidence.
- Historical verified examples remain explicitly labeled with their period. Refresh failure never becomes 'nothing happened'.
- Unknown symbols follow the discovery/extraction pipeline. Insufficient documents produce an honest partial result.
- Model API connection is optional and unconfigured initially. Without a model, provide exact source passages and clearly label extractive research; never claim model analysis ran.
- No trade execution, price predictions, management honesty score, or invented financial results.
- Browser state persists watch questions and preferences on this device only. No cross-user state.

## Architecture
Buildless HTML/CSS/JS frontend. A small JavaScript Worker serves it and the shareable API; Python handles reproducible snapshot collection and provides an understandable reference pipeline. This hosting adaptation preserves approachable Python data preparation while allowing private Sites deployment. Use a local Node server for the same API in development. Deterministic code computes alerts and ranks announcements. PDF text extraction uses a bounded parser; optional model synthesis accepts only extracted evidence and requires citations.

## API contracts
GET /api/bootstrap returns {portfolio,events,asOf,sourceStatus,researchExamples,modelConfigured}.
portfolio: [{symbol,name,sector,price:{close,changePct,volumeRatio,asOf,history:[{date,close,volume}]},error?}].
events: [{id,symbol,company,title,detail,category,priority,publishedAt,url,reason}].
GET /api/refresh returns the same shape with fresh sources; cache for 15 minutes.
GET /api/research?symbol=INFY returns {symbol,name,asOf,mode,summary,findings,commitments,sources,financials?,warnings?}.
findings: [{id,title,body,importance,sourceIds}]. commitments: [{id,topic,statement,target,observed,status,reason,sourceIds}]. Status: met,missed,pending,unclear. sources: [{id,title,url,page?,excerpt,kind,published?}]. financials optional: [{metric,value,unit,period,previousQuarter?,sameQuarterLastYear?,sourceIds}].
POST /api/ask body {symbol,question} returns {answer,sourceIds,sources,mode,warnings?}. Maximum question length 1000. Unconfigured model returns retrieved passages and explicit limits.
POST /api/watch-check body {watches:[{id,symbol,question,createdAt}]} returns {checks:[{id,status,events,checkedAt}],sourceStatus}; at most 30 watches. Surface newly available filings for human review, never equate keyword matches with a proven investment conclusion.
All symbols validated; document URLs come from server-side discovery, with scheme/host/IP validation and bounded downloads. No user-supplied model keys in browser storage or repo.

## Approaches considered
Python-only dashboard: fast but less control over phone interactions. Custom web interface: selected by assistant under delegated judgment, with more implementation effort but stronger fit to product/design evaluation. Native mobile/voice: unnecessary setup for current time budget.

## Acceptance
Phone and desktop usable; briefing filters, evidence panel, research, saved questions and settings work; arbitrary unseen ticker can discover and extract evidence; no manufactured source facts; broken source is explicitly reported; math/date/validation tests pass; independent review; reproducible repo and private deployed URL. A public reviewer link and actual model credentials remain user-controlled setup, not silently assumed.
