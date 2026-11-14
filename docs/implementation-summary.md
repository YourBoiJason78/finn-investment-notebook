# FINN — implementation summary

This is a retrospective summary of AI-assisted development, not a conversation transcript. The original user/assistant conversation is maintained separately for submission.

## Product and architecture

FINN compares management’s original guidance, revised guidance and reported outcomes using deterministic numerical comparisons. It combines a daily brief for 18 mock holdings with company research and browser-local saved questions. The brief processes dated market snapshots and NSE announcements, classifies filings and prioritises relevant updates.

The deployed backend uses JavaScript on Cloudflare Workers. It combines curated historical comparisons with primary-document retrieval for additional NSE symbols. A separate Python collection script prepares the bundled market snapshot.

## Research and AI

The PDF extraction pipeline reads selected pages and retrieves relevant passages with page references. It explicitly discloses incomplete coverage before requesting synthesis from Gemini. Deterministic comparisons, retrieved evidence and generated answers remain separate.

If synthesis fails, FINN returns retrieved excerpts. This is an operational fallback, not a confidence-scoring system. Backend safeguards include source-host restrictions, download limits and timeouts. Partial PDF coverage and source failures remain visible.

AI assistance covered substantial implementation, testing and debugging. Research and review AI subagents supported source verification and defect discovery during development; they are not runtime agents inside the deployed application.

## Interface

I directed repeated visual revisions, selected PP Neue Montreal as my preferred typography direction and requested white, black and stronger colour accents. Licensed PP Neue font files were not supplied, so the interface uses its Arial fallback. Blue identifies primary actions, with amber, mint and coral providing contextual status colours.

## Testing and delivery

Development review uncovered issues involving snapshot-date handling, missing watched-company filings and ambiguous page citations. A subsequent live check exposed a parser bug where sentence splitting could break decimal financial figures. These defects were reproduced and corrected with regression coverage. All 21 automated tests passed before the final application deployment.

I created the Gemini API key and saved it privately. The hosted connection stores it as a server-side secret, and sample generated answers were verified. These checks do not establish comprehensive factual reliability.

Saved questions remain browser-local and checks run on demand. Account synchronisation and background notifications are outside the prototype’s scope. I approved public access to the demo and GitHub repository.
