# Benchmark

Reproduces the effectiveness numbers in the main README. It runs the **actual
extension engine** (`extension/rules.js`) with the bundled GPT-4o tokenizer
(`extension/tiktoken.bundle.js`) over a 30-sentence corpus of written-style
Korean instructions (`corpus.js`).

## Run

```bash
node benchmark/measure.js
```

No dependencies — it uses the tokenizer already bundled in the extension.

## Files

- `corpus.js` — 30 written-style Korean instruction sentences
- `measure.js` — runs the engine over the corpus and prints coverage / token
  totals / average reduction / distribution
