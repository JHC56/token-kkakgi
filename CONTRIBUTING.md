# Contributing

First off, thanks for taking the time to look into this. token-kkakgi is a small
project, so any help — a bug report, a new rule, a fix to the docs — genuinely
makes a difference.

## Ways to help

- **Suggest a new trim rule.** This is the most useful kind of contribution. If
  you keep typing the same wordy Korean phrase into ChatGPT or Claude, there's a
  good chance it can be shortened.
- **Report a bug.** A rule that breaks a sentence's meaning, the badge not
  showing up, the suggestion not applying — all worth reporting.
- **Improve the docs** or fix a typo.

## Adding a rule (please read this part)

There's one thing that trips people up, so it's worth being clear about it:
**shorter text doesn't always mean fewer tokens.**

For example, `~해 주세요` → `~할 것` looks shorter but tokenizes to the same
count. On the other hand `설명해 주세요` → `설명` (turning it into a noun) actually
drops tokens. So before suggesting a rule, please check the before/after in the
[OpenAI Tokenizer](https://platform.openai.com/tokenizer) — the extension uses
`o200k_base` (the GPT-4o family).

If a rule doesn't reduce the token count, or if it changes what the sentence
means, I won't be able to merge it. Not because the effort isn't appreciated —
it's just that those two things are the whole point of the tool.

Rules live in `extension/rules.js`:

- `RAW` — phrase replacements
- `FILLERS` — filler words that get dropped when they stand alone
- `PROTECTED` — words that must never be touched (`반드시`, `절대`, `금지`, …)

When in doubt, lean conservative. Leaving a sentence alone is always better than
changing its meaning.

## Submitting a PR

1. Fork and branch off `main`
2. Make the change
3. Load the `extension/` folder in Chrome (developer mode) and try it on
   chatgpt.com and claude.ai
4. Open the PR and mention the measured token effect for any rule change

That's it. I'll try to get back to you reasonably quickly.
