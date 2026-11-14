# AI collaboration record

This document summarizes the development conversation and decisions. It is **not a verbatim transcript** and does not replace the actual AI conversation export requested in the challenge. Attach an export or a working share link separately.

## User direction

The user supplied the ENAM build challenge, said AI use was permitted, and asked for a distinctive project that would feel human rather than generic. They described their experience as mainly C++, some Python, and roughly two hours available per day. They authorized the assistant to choose a suitable approach and continue implementing it.

The user then rejected several visual directions as too AI-generated. They asked for popular design references, interactive behaviour, consistent modern colours and distinctive fonts; selected PP Neue; then chose a white/black direction with stronger colour accents. They approved the revised look and asked to finish the remaining work.

## AI contribution

Codex helped interpret the brief, propose FINN, investigate source availability, prepare dated company examples, implement collection and API code, build the interface, add tests, review defects, and prepare documentation. Separate research and review passes contributed source checks and backend findings. The final visual choice came from the user's feedback; the code and many implementation details were AI-assisted.

## Decisions and corrections

- Centred the product on management guidance versions and comparable outcomes, supported by original documents.
- Chose 18 mock holdings and three curated historical cases, plus real retrieval for other NSE symbols.
- Separated deterministic calculations, retrieved passages and optional generated answers.
- Disclosed partial PDF coverage, stale snapshots, unavailable sources and browser-local storage.
- Replaced the initial sage/serif interface with white, black and blue, with amber/mint/coral context colours.
- Kept PP Neue Montreal as a local preference because licensed webfont files were not supplied.
- Independent review found and reproduced a snapshot cutoff bug, missing filings for extra watched symbols, and ambiguous page citations. All were fixed with failing-then-passing regression tests.

## What has not been established

The user created a Gemini API key and supplied it through an ignored local settings file. It was stored as a hosted secret. Live checks on 14 November 2026 covered the Infosys guidance comparison and WIPRO margin evidence. The WIPRO check exposed sentence splitting at decimal points; a reproducing test failed before the parser was corrected, and all 21 tests then passed. These examples do not establish broad generated-answer reliability. The development history should not be presented as entirely manual work. The user still needs to understand and personally review the project, choose reviewer access, and supply the actual conversation record before submission.
