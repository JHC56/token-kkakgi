# Token-kkakgi (토큰깎이)



Trim verbose Korean phrasing to cut tokens in ChatGPT & Claude

<p align="center">
  <img src="https://img.shields.io/badge/license-Apache_2.0-orange.svg" alt="License">
  <img src="https://img.shields.io/badge/version-1.0-blue.svg" alt="Version">
</p>

<p align="center">
  <img src="img/logo" width="75%">
</p>


&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
## Abstract
Korean uses more tokens than English for the same meaning.[¹](#ref) This cost adds up especially in text that is **sent on every turn**, such as system prompts or project instructions.
token-kkakgi rewrites the wordy honorific style common in such text (`~해 주시기 바랍니다`, `~하는 것이 좋습니다`) into a concise form while preserving meaning and grammar.

It suggests edits next to the input box, and is **designed so that all processing happens inside the user's browser** — your input is never sent to an external server. Open source (Apache 2.0).

<sub><a name="ref"></a>¹ Token-count length for the same text varies significantly across languages (Petrov et al., [NeurIPS 2023](https://arxiv.org/abs/2305.15425)).</sub>

&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
## Demo

### chatgpt
https://github.com/user-attachments/assets/4f9c75ba-56f2-44e3-87e7-1def18a3ac43


### claude
https://github.com/user-attachments/assets/86089ec9-5cbd-4268-9bfd-8c78eb348748

**1. "이 코드를 검토해 주시기 바랍니다. 또한 성능도 분석해 주시면 감사하겠습니다.** -> 이 코드를 검토할 것. 성능도 분석 요망.<br><sub>"Please review this code. We would also appreciate it if you could analyze its performance."</sub>

**2. "이 부분을 이 부분을 수정하고 그리고 그리고 테스트해 주세요."** -> 이 부분을 이 부분을 수정하고 테스트.<br><sub>"Plz modify this part and this part, and then test it."</sub>

->Shortening sentence length naturally reduces the number of tokens.

&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
## Install

### Option A — Chrome Web Store _(coming soon)_
Search for "token-kkakgi" in the store and add it.

### Option B — Developer mode (right now)
1. Open `chrome://extensions` → turn on **Developer mode** (top right)
2. Click **Load unpacked** → select the **`extension/` folder**
3. Go to `chatgpt.com` (or `claude.ai`) → click the input box → click the badge (top right) → apply suggestions

&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
## Features

- Inline suggestions (badge at the top-right of the input box → suggestion card)
- Apply suggestions **individually or all at once**
- **Per-word token breakdown** — shows which words cost the most tokens
- **Draggable** suggestion card
- Removes accidental **adjacent repeats** (e.g. `검토 검토` → `검토`); emphatic repeats are preserved
- Meaning-critical words (`반드시` *must*, `절대` *never*, `금지` *forbidden*) are left untouched
- **Local processing** — designed not to send your text to any external server

&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
## Effectiveness (measured)

> Tokenizer: **`o200k_base`** (GPT-4o family), bundled in the extension. Counts are **exact on ChatGPT**;
> on Claude they are an approximation (Claude's tokenizer is private; the trend is the same).
> Anyone can reproduce these by pasting the sentences into the [OpenAI Tokenizer](https://platform.openai.com/tokenizer).


### Per-sentence examples
Korean sentences are kept as-is (this tool operates on Korean); English glosses are added for readers.

| Original → Trimmed | Before | After | Saved |
|---|:---:|:---:|:---:|
| 코드를 작성하기 전에 항상 요구사항이 모호한지 먼저 확인해 주시기 바랍니다. → …확인할 것.<br><sub>"Always check whether the requirements are ambiguous before writing code."</sub> | 21 | 18 | **14%** |
| 요청받지 않은 추상화 계층은 추가하지 말아 주세요. 또한 불필요한 예외 처리도 지양해 주시기 바랍니다. → …말 것. …지양할 것.<br><sub>"Do not add unrequested abstraction layers; also avoid unnecessary exception handling."</sub> | 34 | 29 | **15%** |
| 보안 취약점에 대해서 정기적으로 점검해 주시기 바랍니다. → 보안 취약점을 정기적으로 점검할 것.<br><sub>"Check for security vulnerabilities regularly."</sub> | 18 | 13 | **28%** |
| 성능 최적화를 진행하기 전에 반드시 프로파일링을 수행할 필요가 있습니다. → …프로파일링을 수행 필요함.<br><sub>"You must profile before optimizing performance."</sub> | 19 | 17 | **11%** |
| 테스트 커버리지를 80% 이상으로 유지하는 것을 최우선으로 생각합니다. → …유지하는 것을 우선시함.<br><sub>"Keeping test coverage above 80% is the top priority."</sub> | 21 | 19 | **10%** |
| 이 프로젝트에서는 매직 넘버 사용을 지양해 주시기 바랍니다. → …지양할 것.<br><sub>"Avoid using magic numbers in this project."</sub> | 17 | 14 | **18%** |
| 배포 자동화 파이프라인을 구축하는 것을 권장합니다. → …구축하는 것을 권장함.<br><sub>"Building a deployment automation pipeline is recommended."</sub> | 16 | 16 | **0%** |
| **Total** | **146** | **126** | **13.7%** |

&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
### Full-corpus measurement (30 written-style instructions)

| Metric | Value |
|---|---|
| Coverage (≥1 suggestion) | 29/30 (**97%**) |
| Total tokens | 570 → 503 |
| **Average reduction** | **11.8%** |
| Sentence distribution | reduced 25 · unchanged 5 · increased 0 |

&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
## Repository structure

```
extension/          Chrome extension source (load this folder)
  manifest.json
  claude.js / chatgpt.js     per-site UI logic (domain-split)
  content.css                panel styles
  rules.js                   rule engine (core)
  tiktoken.bundle.js         GPT-4o tokenizer counting (js-tiktoken, MIT)
  popup.html
  icons/
PRIVACY.md          privacy policy
```

Add or edit rules in `extension/rules.js`: `RAW` (phrases), `FILLERS` (filler words),
`PROTECTED` (words never touched).


&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
## Limitations

- **Target is written-style instructions/prompts.** Conversational honorifics are already concise,
  so the effect is minimal there.
- **Rule-based**: only trims registered expressions. Expressions not in the dictionary are not handled.
- **Character count ≠ token count.** `~해 주세요` only saves tokens when turned into a noun form
  (`설명해 주세요`→`설명`); changing it to `~할 것` keeps the same count. Every rule was adopted only
  after verifying token reduction with a real tokenizer.
- **Token counts are approximate.** The extension uses the GPT-4o tokenizer (`o200k_base`) via a
  bundled js-tiktoken. The **per-word numbers are each word counted in isolation**, so their sum may
  differ slightly from the whole-sentence count (tokenization is context-dependent). The **total count
  is also approximate** — the actual prompt may include system tokens added by the service. On Claude,
  counts further differ because Claude's tokenizer is private (use the Anthropic token counting API for
  Claude-exact counts).
- The write-back into the input box (ProseMirror-style editors on both sites) may need maintenance if
  ChatGPT or Claude changes its UI.

&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
## License

[Apache License 2.0](LICENSE). The extension bundles `js-tiktoken` (MIT) for token counting; see `NOTICE`.

Contributions welcome — for new phrasing rules in `extension/rules.js`, please verify the token reduction with a tokenizer before opening a PR.
