# Redshop · Order Options

[中文](README.md) · [Verification record](QA.md)

**Keep what matters.** An independent product-design prototype by Siyuan Liu (刘思源).

A fixed two-item cart → complete checkout quote → optional order adjustment → editable requirements → exact change review → version-checked update / undo. No purchase is made.

## Run in one command

Requires Node.js 20+. No package installation or API key:

```sh
npm start
```

Open **http://localhost:8080**. Do not double-click `index.html`: module loading and microphone permissions require a web origin. Run checks with `npm test`.

## Recommended 90-second exploration

1. Click **Check out(2)**. Scroll within the phone to **Payment details**. The complete fixture total is **$67.00**.
2. Open **See order options**. The suggested floral-mug replacement totals **$50.50**. No item is locked. Under **Other ways to lower your total**, select **Keep my original mug** to compare a **$62.34** necklace replacement, then review, update, and Undo.
3. Open **Review changes**, then **Update order**. The order updates only after confirmation; **Undo** restores the prior draft.
4. Use the “Still floral, and under $40” scenario. Confirm conditions. No matching offer is returned; edit the requirement or return unchanged.
5. Try **Test a failure → Shipping increases by $2**, then confirm an option. A second confirmation is required; a quote exceeding the budget cannot apply.

The automatic **Guided walkthrough** operates the actual interface. Scenario shortcuts are clearly labeled fixtures, not generated AI output.

## Real AI, without API bills

The app calls **Qwen2.5-0.5B-Instruct** through **WebLLM 0.2.79** (GPU) or **Transformers.js 3.8.1** (CPU / WASM) in a Web Worker. This is real on-device model inference, not a hosted API or a keyword parser. It extracts constraints from arbitrary English/Chinese input, updating only explicitly mentioned requirements and preserving previous conditions. The user checks the interpretation before refreshing options. GPU availability is checked; the CPU path works without WebGPU, but can be slower. Output is validated and shown for correction before use. A conservative explicit-wording rule prevents unsupported exact-mug locks; any correction is disclosed in the form. This rule does not replace model interpretation of the other fields.

- Open **On-device AI & voice → Load local language model**, or type a request and choose **Load AI & interpret**.
- Requires a secure context (HTTPS / localhost), a modern browser/device, sufficient memory, and access to model/CDN hosts. Initial model download is substantial (hundreds of MB); progress appears in the panel. No payment account or billing API is used.
- Small-model extraction is fallible. All conditions remain editable. Unsupported or invalid results fail visibly.
- Manual conditions work without a model and are explicitly identified as manual, never mislabeled as AI.
- Images are used by the interface and fixed catalogue; this version's model input is **text**, not live image reasoning. Simulated browsing/history affects deterministic ranking. No Xiaohongshu data is accessed.

## Real voice

Microphone audio is captured with `getUserMedia` + `MediaRecorder`, with a 30-second limit and local playback. Choose either:

- **Browser speech service**: native SpeechRecognition where supported. May send audio to the browser's provider; requires that service and network.
- **Local Whisper**: Transformers.js 3.8.1 / `onnx-community/whisper-tiny`, q8, WASM in a Worker. Downloads model assets, then transcribes recorded audio locally. English and Mandarin supported.

Review/edit the transcript before language-model interpretation. Permission denial, no device, recognition errors and model-loading errors are shown. Closing the sheet stops microphone tracks. Recordings are held in memory, not uploaded to a Redshop server or stored in the repository.

## What is real vs simulated

| Real implementation | Explicitly simulated |
|---|---|
| Navigation, modals, expandable details, text editing, input validation | Merchandise availability, prices, fees, eligibility, stock failures |
| Audio capture, playback and speech-recognition integrations | Destination fixed to New York 10018 |
| On-device LLM request / JSON validation / condition confirmation | Session/history context, no account-data connection |
| Constraint filtering, cent-based totals, state/version updates, undo | Payment method and purchase completion |

The initial cart always contains a necklace and a floral cup. The recommendation pool has two mug alternatives and one necklace alternative. Fictional floral mug and necklace SKUs use separately labeled AI-generated illustrations. Explicit keep requirements protect items; each candidate changes at most one item. There is no unrestricted catalogue browsing, quantity editing, removal, real address, login or payment.

## Structure

- `dist/app.js`: interface state, transitions, input, voice lifecycle, model calls.
- `dist/engine.js`: catalogue fixtures, integer-cent quotes, constraints and order-version checks.
- `dist/ai-worker.js`: real local language-model loading and inference.
- `dist/asr-worker.js`: real local Whisper transcription.
- `dist/style.css`: responsive studio, phone shell and native-inspired components.
- `tests/engine.test.js`: invariants for totals, budgets, preferences, no-match, stale updates.
- `.github/workflows/pages.yml`: optional GitHub Pages deployment. Repository owner enables Pages with GitHub Actions.

## Publishing

The `dist/` folder can be hosted on any HTTPS static host. GitHub Pages workflow is included. Do **not** commit API keys; none are needed. The included photos come from the author's supplied shopping screenshots and are retained as product-design reference materials. Third-party brands and images are not claimed as original work or relicensed. Source-code license applies only to original code.

## References

- WebLLM: https://webllm.mlc.ai/docs/
- Transformers.js: https://huggingface.co/docs/transformers.js/
- Microphone: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
- SpeechRecognition: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition

## Validation limits

See `QA.md` for executed checks and environment-specific verification limits. A demo is not evidence of live platform integration, conversion uplift, or production readiness.


## Focused refinement — 1 November 2026

38 deterministic engine checks pass. Added single-object pronoun preservation, targeted clarification for ambiguous protection, replacement-seller coupon consistency, and optional saved-original-cup ranking. Before/after previews expose losses before confirmation. Per-condition source labels distinguish interpreted requests from confirmed selections. Browser speech and local Whisper remain implemented but physical microphone transcription is not verified in this environment. Three replacement fixtures remain deliberately bounded.
