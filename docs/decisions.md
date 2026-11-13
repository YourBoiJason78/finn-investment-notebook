# Why FINN is built this way

## A versioned promise, not a generic summary

The Infosys example is the centre of the product because it exposes a real ambiguity: original guidance and revised guidance produce different comparisons. FINN preserves both dates, the measurement period and the metric. It does not turn a difference into a management honesty score.

## Deterministic facts, optional synthesis

Price/volume arithmetic, disclosure ranking and verified case comparisons are deterministic. The model is reserved for explaining retrieved primary evidence. This makes source failures and model failures separable. The cost is that the keyless version feels more like a research notebook than a chat assistant.

## Primary documents and bounded reading

Document discovery uses Screener links, but research content comes from company reports and transcripts hosted by the company or exchange. PDF size, page count, redirects and timeouts are bounded for a lightweight Worker deployment. That keeps requests manageable but can miss relevant pages; coverage warnings are part of the result. Extending the allowed issuer hosts and introducing indexed, section-aware retrieval are next steps.

## A useful push surface with limited delivery

The brief highlights material disclosure types and threshold-crossing prices. Routine notices remain accessible. Saved questions check newer filings when opened or requested. There is no scheduler or background notification service in this prototype. Adding one before validating the evidence flow would broaden infrastructure without improving the central demonstration.

## Python for collection, JavaScript for the hosted API

The user is comfortable with C++ and knows some Python. Python handles snapshot collection. The online API uses JavaScript because the chosen hosting environment runs Workers, not a Python server. The tradeoff is a second language to understand; small modules and direct HTTP interfaces keep that explanation manageable.

## Honest historical cases

FY2025 examples show completed guidance-to-outcome comparisons, labelled as historical. Arbitrary symbols take the real retrieval path. They do not inherit another company's cached example when retrieval fails.

## The visual direction

White and black carry most of the interface. Saturated blue marks selection and action; amber signals historical context; mint and coral accompany labelled outcomes. Motion is limited to selection, expansion and short transitions, with reduced-motion support. PP Neue Montreal requires a licence and actual font files; the repository has a local-font preference and Arial fallback.

## Review findings fixed

The independent backend review reproduced three errors: reprocessed intraday candles became EOD, non-portfolio watched symbols were omitted from filing checks, and different passages from a PDF shared an ambiguous citation ID. Four regression checks were observed failing, then passing after the fixes. All 20 automated checks pass. A mocked model checks citation transport; it is not a live model reliability evaluation.
