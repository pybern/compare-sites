# README Report Review (Validation + Improvements)

This document reviews the report currently in `README.md` (“Vehicle Transport Website Comparison Analysis”), validates key quantitative claims against the repo’s data artifacts, spot-checks a few external benchmark/standards claims, and suggests concrete improvements.

## What I validated (and how)

- **Quote volume + vehicle-type breakdown**: validated directly from `email_results.json` by parsing the HTML field `"<strong>Type:</strong> …"`.
- **A few “industry standard” assertions**: spot-checked against authoritative sources (W3C WCAG and Google/Web.dev Core Web Vitals documentation).
- **A couple competitor “social proof” claims**: spot-checked via live page fetches on Jan 2, 2026 (may vary over time).

## Validation results

### Vehicle Type Quote Statistics (Non‑Car Segment)

The README claims:

- **Total quotes (last 30 days): 554**
- Category counts/shares listed in the table (Oversized, Salvage, Caravan, etc.)

**Confirmed:** `email_results.json` contains **554** emails with bodies.

**Confirmed (mostly):** the category counts and percentages in the README match the `Type:` field values in `email_results.json` for the listed categories.

**Issue: the table does not sum to 554.**  
The counts shown in the README table add up to **553**, not 554. The underlying data includes one additional `Type` value:

- `T`: **1** (0.2%)

**Recommendation:** roll `T` into **Other** (making Other = 5) or fix the upstream data/normalization so `T` maps to a real category.

### Competitor “reviews” claim (UpMove)

The README claims **2,336 reviews (9.7 rating)**.

**Observed on Jan 2, 2026:** UpMove’s nav shows **Reviews (2,338)** and a **9.7** rating.  
Recommendation: update the README number and add “as of Jan 2, 2026” next to any such volatile metrics.

### Competitor “100,000+ vehicles moved” claim (National Car Movers)

The README references a “100,000+ vehicles moved” claim.

**Observed on Jan 2, 2026:** National Car Movers homepage contains wording consistent with “moved over **100,000** cars to date.”  
Recommendation: quote the exact phrasing and add “as of Jan 2, 2026” + a page path.

## Standards / benchmark spot-checks (important fixes)

### Touch target guidance

README statement: “**WCAG 2.1 recommends minimum 44x44px touch targets**.”

**Not accurate.** WCAG **2.2** introduced:

- **SC 2.5.8 Target Size (Minimum) (AA):** at least **24 by 24 CSS pixels**
- **SC 2.5.5 Target Size (Enhanced) (AAA):** at least **44 by 44 CSS pixels**

Source: W3C WCAG 2.2, `https://www.w3.org/TR/WCAG22/#target-size-minimum`

**Recommendation:** change wording to “WCAG 2.2 (AA) requires 24×24 CSS px (with exceptions); 44×44 is the enhanced AAA target” and, if you prefer 44×44 as a design goal, attribute it as an internal guideline (or to platform HIGs).

### Core Web Vitals thresholds

README lists CWV targets (LCP <2.5s, INP <200ms, CLS <0.1). These are consistent with Google/Web.dev guidance:

- LCP: `https://web.dev/articles/lcp`
- INP: `https://web.dev/articles/inp`
- CLS: `https://web.dev/articles/cls`

**Recommendation:** keep these, but remove “Est.” numbers unless you have Lighthouse/CrUX evidence, and add a “measured with” note (e.g., Lighthouse settings, device, throttling).

### “65% of users don’t scroll past first viewport” benchmark

README states: “Industry benchmarks suggest **65% of users** don’t scroll past the first viewport on mobile.”

This is **high-risk without citation** and likely misleading as a general benchmark. NN/g’s eye-tracking summary emphasizes that users do scroll more than they used to, but attention is still concentrated near the top; it cites **~74% of viewing time in the top two screenfuls** (above the fold + immediately below).  
Source: `https://www.nngroup.com/articles/scrolling-and-attention/`

**Recommendation:** replace the 65% claim with a cited statement about *attention distribution* (e.g., “top-of-page receives the majority of attention”) and keep your scroll-depth numbers as *site-specific measurements* if you have analytics.

## Main issues in the report (and suggested improvements)

### 1) Observed vs inferred vs estimated are mixed together

Examples:

- “Est. conversion index”, “-10% potential”, “Estimated 3.5–4% conversion”
- “Top 5% of logistics websites”
- “All sites: no dark mode”

**Recommendation:** add labels and confidence:

- **Measured** (with tool + date)
- **Observed qualitatively** (with page path + date)
- **Hypothesis / estimate** (with rationale + what would validate it)

### 2) Scoring looks precise, but methodology isn’t reproducible

You have a weight table (Design 25%, UX 20%, etc.) but not:

- the rubric per dimension (what earns 65 vs 85 vs 95),
- who scored it (single rater vs multiple),
- whether scores were normalized across competitors.

**Recommendation:** add a short “Scoring rubric” appendix (even 5–8 bullets per dimension) and explicitly say “single-rater heuristic scoring” if true.

### 3) Internal consistency issues

- Executive Summary says **87/100** overall for WeMoveX; Detailed Scoring shows **87.8/100**.
- Vehicle-type table sum mismatch (553 vs 554, due to `T`).
- “Non-Car Segment” includes “Oversized Vans, Utes and 4WD’s” (many people will interpret that as “cars”).

**Recommendation:** standardize rounding (e.g., 1 decimal everywhere), fix the missing category, and rename the section to something like **“Non-standard vehicle types (incl. oversized)”**.

### 4) Competitor reassessment claims need tighter definitions

The “explicitly listed / implied / not mentioned” matrix can be challenged unless you define:

- which pages were inspected (home only vs nav vs services),
- what counts as “explicit” (hero, nav item, H2, footer, blog mention, etc.),
- whether you used search or site-wide crawl.

**Recommendation:** for each competitor, list **exact URLs** inspected (you do this for CEVA, which is good), and define “explicit” as “service offering described on services pages or primary navigation”, excluding blog content.

### 5) CRO uplift numbers look fabricated without evidence

Claims like “+15% conversion”, “-12% first impression”, etc. should be either:

- backed by your own experiment results, or
- backed by a cited benchmark source, or
- rephrased as “expected directionality” and moved into a test plan.

**Recommendation:** convert these into a simple experiment backlog (A/B test: hero form vs no hero form; live chat on/off; social proof placement; etc.) and remove numeric lifts unless measured.

## Concrete edits to consider in `README.md`

- **Fix the quote breakdown** to account for the extra `Type: T` row (or map it to Other).
- **Correct WCAG touch target wording** (WCAG 2.2 AA = 24×24, AAA = 44×44).
- **Replace / cite** the “65% don’t scroll past first viewport” statement; prefer a cited attention distribution claim.
- **Add “as of Jan 2, 2026”** next to volatile competitor metrics (UpMove reviews, etc.) and consider quoting the source text.
- **Clarify what is measured** (data-backed) vs what is opinionated scoring vs what is forecast.
- **Reduce absolutes** (“outperforms all”, “should replace”) or add the gating criteria (analytics validation, usability tests, accessibility checks, Lighthouse targets).

## Reproducing the quote breakdown (from repo data)

The breakdown can be reproduced from `email_results.json` by extracting the HTML “Type” field. The repo already contains a reference implementation in `summarize-types.ts` (it uses a regex for `<strong>Type:</strong> …`).

Note: this environment didn’t have `bun` available, so validation was done with a small Python script, but the logic matches `summarize-types.ts`.

