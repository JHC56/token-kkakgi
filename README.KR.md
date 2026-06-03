# Token-kkakgi (토큰깎이) - beta

[ENGLISH README](README.md) | 한국어 README

>Trim verbose Korean phrasing to cut tokens in ChatGPT & Claude
>
>Claude와 GPT의 한국어 프롬프트 토큰을 절약해 주는 크롬 확장 프로그램입니다.

<p align="center">
  <img src="https://img.shields.io/badge/license-Apache_2.0-orange.svg" alt="License">
  <img src="https://img.shields.io/badge/version-1.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/extension-ChatGPT-10A37F.svg" alt="ChatGPT">
  <img src="https://img.shields.io/badge/extension-Claude-D97756.svg" alt="Claude">
</p>

<p align="center">
  <img src="img/logo" width="75%">
</p>

&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
### 1. ChatGPT
https://github.com/user-attachments/assets/4f9c75ba-56f2-44e3-87e7-1def18a3ac43


### 2.Claude
https://github.com/user-attachments/assets/86089ec9-5cbd-4268-9bfd-8c78eb348748

**1. "이 코드를 검토해 주시기 바랍니다. 또한 성능도 분석해 주시면 감사하겠습니다.** -> 이 코드를 검토할 것. 성능도 분석 요망.

**2. "이 부분을 이 부분을 수정하고 그리고 그리고 테스트해 주세요."** -> 이 부분을 수정하고 테스트.


-> 결론적으로 단어를 조금씩만 변경하면 토큰 수가 줄어듭니다.

&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
## 개요
한국어는 같은 의미라도 영어보다 토큰을 더 많이 사용합니다.[¹](#ref) 이 비용은 특히 시스템 프롬프트나 프로젝트 지침처럼 **매 턴마다 전송되는 글**에서 누적됩니다.
token-kkakgi는 장황한 존댓말 표현(`~해 주시기 바랍니다`, `~하는 것이 좋습니다`)을 의미와 문법을 보존하면서 간결한 형태로 바꿔 줍니다.

입력창 옆에서 다듬을 표현을 제안하며, **모든 처리가 사용자의 브라우저 안에서 이루어지도록 설계**되어 입력 내용이 외부 서버로 전송되지 않습니다. 

<sub><a name="ref"></a>¹ Token-count length for the same text varies significantly across languages (Petrov et al., [NeurIPS 2023](https://arxiv.org/abs/2305.15425)).</sub>


&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
## 기능

- 인라인 제안 (입력창 우상단 배지 → 제안 카드)
- 제안을 **개별 또는 한 번에** 적용
- **단어별 토큰 분해** — 무슨 단어가 토큰을 많이 쓰는지 표시
- 실수로 인접하게 **반복된 표현 제거** (예: `검토 검토` → `검토`); 강조를 위한 반복은 보존
- 의미상 중요한 단어(`반드시`, `절대`, `금지`)는 건드리지 않음
- **로컬 처리** — 입력 내용을 외부 서버로 전송하지 않도록 설계

&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
## 설치

### 방법 A — 크롬 웹스토어 _(준비 중)_
스토어에서 "token-kkakgi"를 검색해 추가하세요.

### 방법 B — 개발자 모드 (지금 바로)
1. `chrome://extensions` 접속 → 우상단 **개발자 모드** 켜기
2. **압축해제된 확장 프로그램을 로드합니다** 클릭 → **`extension/` 폴더** 선택
3. `chatgpt.com`(또는 `claude.ai`) 접속 → 입력창 클릭 → 우상단 배지 클릭 → 제안 적용


&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
## 효과 (측정)

> 토크나이저: **`o200k_base`** (GPT-4o 계열), 확장에 번들됨. 토큰 수는 **ChatGPT에서는 정확**하며,
> Claude에서는 근사치입니다(Claude의 토크나이저는 비공개이며, 경향은 동일합니다).
> [OpenAI Tokenizer](https://platform.openai.com/tokenizer)에 문장을 붙여넣으면 누구나 재현할 수 있습니다.


### 문장별 예시
한국어 문장은 그대로 두었으며(이 도구는 한국어를 처리합니다), 독자를 위해 영어 설명을 덧붙였습니다.

| 원본 → 다듬은 결과 | 이전 | 이후 | 절감 |
|---|:---:|:---:|:---:|
| 코드를 작성하기 전에 항상 요구사항이 모호한지 먼저 확인해 주시기 바랍니다. → …확인할 것.<br><sub>"Always check whether the requirements are ambiguous before writing code."</sub> | 21 | 18 | **14%** |
| 요청받지 않은 추상화 계층은 추가하지 말아 주세요. 또한 불필요한 예외 처리도 지양해 주시기 바랍니다. → …말 것. …지양할 것.<br><sub>"Do not add unrequested abstraction layers; also avoid unnecessary exception handling."</sub> | 34 | 29 | **15%** |
| 보안 취약점에 대해서 정기적으로 점검해 주시기 바랍니다. → 보안 취약점을 정기적으로 점검할 것.<br><sub>"Check for security vulnerabilities regularly."</sub> | 18 | 13 | **28%** |
| 성능 최적화를 진행하기 전에 반드시 프로파일링을 수행할 필요가 있습니다. → …프로파일링을 수행 필요함.<br><sub>"You must profile before optimizing performance."</sub> | 19 | 17 | **11%** |
| 테스트 커버리지를 80% 이상으로 유지하는 것을 최우선으로 생각합니다. → …유지하는 것을 우선시함.<br><sub>"Keeping test coverage above 80% is the top priority."</sub> | 21 | 19 | **10%** |
| 이 프로젝트에서는 매직 넘버 사용을 지양해 주시기 바랍니다. → …지양할 것.<br><sub>"Avoid using magic numbers in this project."</sub> | 17 | 14 | **18%** |
| 배포 자동화 파이프라인을 구축하는 것을 권장합니다. → …구축하는 것을 권장함.<br><sub>"Building a deployment automation pipeline is recommended."</sub> | 16 | 16 | **0%** |
| **합계** | **146** | **126** | **13.7%** |

&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
### 전체 말뭉치 측정 (문어체 지시문 30문장)

| 지표 | 값 |
|---|---|
| 커버리지 (제안 1개 이상) | 30/30 (**100%**) |
| 총 토큰 | 575 → 505 |
| **평균 절감률** | **12.2%** |
| 문장 분포 | 줆 23 · 동일 7 · 늚 0 |

`node benchmark/measure.js`로 재현할 수 있습니다 — 실제 확장 엔진(`extension/rules.js`)과
번들된 토크나이저로 30문장 코퍼스를 측정합니다.

&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
## 저장소 구조

```
extension/          크롬 확장 소스 (이 폴더를 로드)
  manifest.json
  claude.js / chatgpt.js     사이트별 UI 로직 (도메인 분리)
  content.css                패널 스타일
  rules.js                   규칙 엔진 (핵심)
  tiktoken.bundle.js         GPT-4o 토크나이저 토큰 계산 (js-tiktoken, MIT)
  popup.html
  icons/
PRIVACY.md          개인정보 처리방침
```

규칙 추가·수정은 `extension/rules.js`에서 합니다: `RAW`(어구), `FILLERS`(군더더기 단어),
`PROTECTED`(절대 건드리지 않는 단어).


&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
## 한계

- **대상은 문어체 지시문/프롬프트입니다.** 대화체 존댓말은 이미 간결해서
  효과가 적습니다.
- **규칙 기반**이라 사전에 등록된 표현만 다듬습니다. 사전에 없는 표현은 처리하지 못합니다.
- **글자 수 ≠ 토큰 수.** `~해 주세요`는 명사형으로 바꿀 때만 토큰이 줄어듭니다
  (`설명해 주세요`→`설명`); `~할 것`으로 바꾸면 토큰 수가 동일합니다. 모든 규칙은
  실제 토크나이저로 토큰 감소를 확인한 뒤에만 채택했습니다.
- **토큰 수는 근사치입니다.** 확장은 번들된 js-tiktoken을 통해 GPT-4o 토크나이저(`o200k_base`)를
  사용합니다. **단어별 숫자는 각 단어를 단독으로 센 값**이라, 그 합이 문장 전체 값과 약간
  다를 수 있습니다(토큰화는 문맥에 의존). **전체 토큰 수도 근사치**입니다 — 실제 프롬프트에는
  서비스가 추가하는 시스템 토큰이 포함될 수 있습니다. Claude에서는 토크나이저가 비공개라
  값이 더 달라집니다(Claude 정확값은 Anthropic 토큰 카운팅 API를 사용하세요).
- 입력창에 결과를 써넣는 처리(양 사이트의 ProseMirror 계열 에디터)는 ChatGPT나 Claude가
  UI를 변경하면 유지보수가 필요할 수 있습니다.

&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
## 라이선스

[Apache License 2.0](LICENSE). 확장은 토큰 계산을 위해 `js-tiktoken`(MIT)을 번들합니다; `NOTICE` 참고.

기여 환영합니다 — `extension/rules.js`에 새 어구 규칙을 추가할 때는 PR 전에 토크나이저로 토큰 감소를 확인해 주세요.
