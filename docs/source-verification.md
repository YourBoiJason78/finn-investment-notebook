# Research source verification

Checked: 11 November 2026. These are deliberately historical FY2025 examples, covering the year ended 31 March 2025. `asOf` is the financial period end, not a claim that research is current. Each JSON pack includes this warning.

## Scope and method

Research claims use only official company annual reports and earnings-call transcripts. Search results and IR landing pages were used to locate the documents; secondary commentary and company press releases were not used as research evidence. Relevant PDF passages were read through the web document parser and compared with the stored findings. Short excerpts are direct source text, with PDF line breaks/typographic spacing normalized. All calculations below use full-year percentages on matching bases.

No full report is included in application data. Direct local download attempts returned HTTP 403 for Infosys/TCS and timed out for HCLTech; the web document parser could read the listed official sources. The initial HCLTech annual-report URL was too large for one web fetch, so the separately indexed official copy below was read. Download attempts and scratch scripts live only in ignored `work/research/`.

## Checked sources

### INFY

- **infy-initial** — [Q4 FY2024 earnings call · 18 April 2024](https://www.infosys.com/investors/reports-filings/quarterly-results/2023-2024/q4/documents/transcripts/earningscall.pdf); verified one-based PDF page 4.
- **infy-revision** — [Q3 FY2025 earnings call · 16 January 2025](https://www.infosys.com/investors/reports-filings/quarterly-results/2024-2025/q3/documents/transcripts/earningscall.pdf); verified one-based PDF page 4.
- **infy-outcome** — [Q4 FY2025 earnings call · 17 April 2025](https://www.infosys.com/investors/reports-filings/quarterly-results/2024-2025/q4/documents/transcripts/earningscall.pdf); physical PDF page not asserted.
- **infy-annual** — [Integrated Annual Report 2024–25 · Letter to the Shareholder](https://www.infosys.com/investors/reports-filings/annual-report/annual/documents/infosys-ar-25.pdf); physical PDF page not asserted.

### HCLTECH

- **hcl-initial** — [Q4 FY2024 earnings call · 26 April 2024](https://www.hcltech.com/sites/default/files/document/open/call-trans/2024-04/HCLTech-Earnings-Apr26-2024.pdf); verified one-based PDF page 7.
- **hcl-outcome** — [Q4 FY2025 earnings call · 22 April 2025](https://www.hcltech.com/sites/default/files/documents/investor-reports/HCLTech-Earnings-Q4FY25-Transcript.pdf); physical PDF page not asserted.
- **hcl-annual** — [Annual Report 2024–25 · Management Discussion and Analysis, Business Highlights](https://www.hcltech.com/sites/default/files/documents/resources/pdf-landing-page/files/2025/08/02/Annual-Report-2024-25.pdf); physical PDF page not asserted.

### TCS

- **tcs-intent** — [Q1 FY2025 earnings call · 11 July 2024](https://www.tcs.com/content/dam/tcs/investor-relations/financial-statements/2024-25/q1/Management%20Commentary/Transcript%20of%20the%20Q1%202024-25%20Earnings%20Conference%20Call%20held%20on%20Jul%2011%2C%202024.pdf); physical PDF page not asserted.
- **tcs-outcome** — [Q4 FY2025 earnings call · 10 April 2025](https://www.tcs.com/content/dam/tcs/investor-relations/financial-statements/2024-25/q4/Management%20Commentary/Transcript%20of%20the%20Q4%202024-25%20Earnings%20Conference%20Call%20held%20at%201900%20hrs%20IST%20on%20Apr%2010%2C%202025.pdf); physical PDF page not asserted.
- **tcs-annual** — [Integrated Annual Report 2024–25 · Human Capital, Talent Development](https://www.tcs.com/content/dam/tcs/investor-relations/financial-statements/2024-25/ar/annual-report-2024-2025.pdf); physical PDF page not asserted.

## Comparisons and limitations

- **INFY:** Original FY2025 revenue guidance, issued 18 April 2024, was 1–3% year-on-year in constant currency. The 16 January 2025 revision was 4.5–5%. The FY2025 outcome was 4.2% on the same basis: 1.2 percentage points above the original upper bound and 0.3 below the revised lower bound. Both target versions remain visible. The `met` status on the original range means exceeded that original growth projection; it does not mean every subsequent forecast was accurate.
- **INFY margin:** Original FY2025 operating-margin guidance was 20–22%; the full-year outcome was 21.1%, inside the band. The Q4 FY2025 call also explains the tax-refund contribution to free cash flow; the pack distinguishes the rounded reported and adjusted dollar amounts.
- **HCLTECH:** Original FY2025 company revenue guidance was 3–5% in constant currency, and operating-margin guidance 18–19%. The full-year call and annual report support 4.7% and 18.3%. Comparisons intentionally refer to original guidance, not a reconstructed sequence of every revision. Growth includes acquisitions; it is not organic growth.
- **TCS:** The July 2024 largest-AI-ready-workforce ambition lacks a common definition, deadline and peer benchmark. The annual report documents skilling activity, which cannot establish that superlative. Status is `unclear`, with no invented revenue promise or inferred hiring target. The reported 42,000 freshers are an outcome only.
- Only three transcript PDF page numbers were independently established by page-aware parsing (INFY original/revision and HCL original). Other source records omit `page`; report section locators appear in titles. Printed report page numbers were not converted into potentially incorrect PDF anchors.
- TCS annual-report publication date is supported by its official [30th AGM document index](https://www.tcs.com/investor-relations/events/tcs-thirtieth-agm), which lists 27 May 2025. Other annual-report publication dates were not independently established and are omitted. Call dates come from the documents.
- Constant-currency growth, reported growth, consolidated revenue and order TCV are kept distinct. TCV is not treated as recognized revenue. Numbers are company-reported; no audit opinion or investment conclusion is inferred.
- This is bounded extractive research prepared without model synthesis. It is not a complete source archive or a comprehensive account of management commitments. Current FY2026/FY2027 filings may exist and are outside these historical packs.

## Data checks

All three JSON files parse. Every finding, commitment and financial row has source IDs resolving inside its pack. Each pack has three to five findings and three to five sources, including an annual report and a transcript. Every direct excerpt has at most 25 whitespace-separated words. Commitment statuses are restricted to met/missed/pending/unclear. Numeric comparisons were rechecked independently.
