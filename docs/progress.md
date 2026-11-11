# Execution ledger — plan: docs/plan.md

Ruling: proceed without another approval round because user said 'do what you think is right'.
Ruling: implement inline with independent source research and final review. This avoids shared-code conflicts.
Ruling: use Worker API for hosted deployment and Python data collection/reference pipeline; Sites cannot host a Python server. Cost: core online request logic is JavaScript and needs explanation.
Pre-flight: frontend consumes exact API contracts in design.md; collector emits bootstrap shape; research packs follow common sourceIds schema.
Initial source checks: Yahoo chart, NSE announcements, BSE and Screener all returned HTTP 200 on this host. Automated collection still requires date and symbol filtering.
