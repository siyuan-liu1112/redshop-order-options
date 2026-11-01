# Verification record

Date: 2026-11-01. This is a prototype QA record, not a claim of production readiness.

## Executed

- Node test runner: 14 engine tests pass. Includes price/SKU reconciliation, coupon eligibility, exclusive budget boundaries, strict vs preferred features, stale order rejection, unknown consolidation charges, unavailable-offer exclusion.
- Browser: cart → checkout → options → review → update → undo.
- Browser: shipping quote increase requires a second confirmation; original order remains unchanged before confirmation.
- Browser: real Qwen 0.5B model downloaded and initialized on the CPU/WASM path.
- Browser: real inference for "Keep the necklace. The mug must have flowers. My total budget is under 40 dollars." correctly produced keepMug=false, floral=must, budget=40. Confirming generated no matching offer.
- Initial zero-shot prompt misinterpreted a condition. Replaced with a narrower schema and explicit examples, then reran the above test. This is why generated conditions are always editable and never directly commit an order.
- HTTPS deployment opened without a login gate after access propagation.
- HTTPS microphone attempt: environment has no microphone; app displayed its no-device recovery message without changing the order.

## Verification limits

- No physical microphone exists in the test environment. Capture/playback and browser speech/Whisper are implemented, but a human-spoken microphone-to-transcript test is not certified here.
- GPU runtime was not available in the preview. CPU/WASM inference was tested; GPU behavior still depends on the visitor's hardware.
- Only a small bounded input sample was tested. No extraction-accuracy percentage is claimed. All AI conditions require user review.
- Prices, inventory, shipping, tax and preference histories are fixtures. No live Redshop API, personal history or payment is connected.
- The video is an annotated sequence of actual browser captures, not a live AI performance benchmark. The in-app Guided walkthrough operates the interface itself.

## Release checks for a reviewer

Run `npm test`, then `npm start`. Use a current Chrome/Edge browser at localhost or the HTTPS site. Try the fixed paths before loading a model. To test real voice, permit the microphone, record a short request, stop and replay, edit the transcript, then review its interpreted conditions. Initial model downloads need internet access and device memory; CPU inference can take tens of seconds.

## Additional finding and protection

A flexible-floral request correctly yielded floral=prefer and budget=30, but the 0.5B model still incorrectly set keepMug=true. A conservative explicit-wording guard now prevents that unsupported lock and visibly asks the user to review the correction. Its boundaries are covered by two extra tests (14 total). This guard is a rule, not a claim of improved model accuracy. Real-language interpretation remains fallible.

## Motion refinement

Short transform/opacity transitions, backward-sheet direction, press feedback, saved draft input and nested-sheet scroll restoration. Reduced-motion preferences are respected. Manual interaction pauses the guided walkthrough.

- Browser responsive QA at a 390 × 844 viewport: cart, checkout and options; fixed primary action and input remained visible.

## Voice and decision UI refinement
- Browser recognition now streams speech directly into editable text, without audio playback. Local Whisper is a fallback with a 120-second timeout.
- Verified denied-microphone recovery and editable transcript handoff through browser UI. Real spoken transcription still needs a physical microphone check.
- Removed duplicate totals, surfaced the product tradeoff, clarified recommendation details, and placed review confirmation below the request composer.

## PRD alignment update
- Entry is now a distinct secondary card; Pay now remains the primary checkout action.
- Original-item audit evaluates eligible discount state and direct/consolidated shipping fixtures; unknown freight is never a saving.
- Real local Qwen browser check: floral under $40 returned no match; follow-up “Then raise my budget to 55.” preserved must-have flowers and produced the $50.50 floral offer after confirmation.
- 24 engine checks cover partial update guards, ambiguous budget preservation and same-item savings priority.
- Scope remains two replacement offers, text-only model, and shared floral ranking for session/history. Existing video predates these refinements.

## Preference and speech recovery revision
- 28 automated checks pass. Default ranking uses original floral/lid attributes; explicit cheapest overrides ranking but not hard constraints.
- Browser UI verified quick floral requirement -> simplified editor -> result, and denied microphone yields explicit failure with disabled Use this text.
- Speech outcome classifier distinguishes empty/end-before-start from success. Empty service end offers local fallback. Physical microphone success remains unverified.
- Blue daisy mug is a fictional sample with an AI-generated image, not a real retrieved offer.

## Explicit item protection and necklace branch
- Default item locks are both false. Higher selected-item price is an exploration heuristic, not an inferred user priority.
- All candidates change at most one item. Both locks preserve both original SKUs; infeasible budgets return no result.
- 34 tests pass, including all mug/necklace quote combinations, replacement-shop coupon eligibility, partial request inheritance, stock exclusion, and committed quote equality.
- Browser verified: initial suggestion → Keep this mug instead → $62.34 necklace option → review → update → matching checkout → Undo → keep both → no lower quote.
- Both replacement illustrations are labeled fictional. Voice verification limits from earlier revisions still apply.


## Focused refinement — 1 November 2026

38 deterministic engine checks pass. Added single-object pronoun preservation, targeted clarification for ambiguous protection, replacement-seller coupon consistency, and optional saved-original-cup ranking. Before/after previews expose losses before confirmation. Per-condition source labels distinguish interpreted requests from confirmed selections. Browser speech and local Whisper remain implemented but physical microphone transcription is not verified in this environment. Three replacement fixtures remain deliberately bounded.

## Submission closeout — 1 November 2026

- Re-ran the live v9 path: cart → complete checkout → suggested option → exact review → update → undo.
- Confirmed strict floral / keep-necklace / under-$40 produces no match; changing only budget to $55 restores the floral option and preserves other requirements.
- Confirmed +$2 shipping shows $50.50 → $52.50 and requires a new confirmation.
- Checked first-use AI download disclosure and the manual-condition fallback; entered text and existing conditions remain visible. This pass did not repeat model inference or microphone transcription.
- Replaced the outdated video with a 56-second captioned sequence of current, actual browser screens. This is a visual walkthrough, not real-time performance evidence or a voice demonstration.
- Updated both README languages to current entry/option labels and both substitution directions. Selecting an option previews it; it does not automatically lock an item.
- Physical microphone transcription, physical-phone browser compatibility, and formal US-user usability research remain unverified. The fixed phone shell was visually reviewed on desktop.
