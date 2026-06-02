/* 한국어 간결화 규칙 엔진 (맞춤법 검사기 방식)
 * - 형태소 엔진 없이, 잘 정리된 "장황한 표현 -> 간결한 표현" 사전 + 경계 처리로 동작
 * - 모든 제안은 사용자가 하나씩 확인/적용 (맞춤법 검사기 UX)
 * - 의미를 바꿀 위험이 큰 변환은 넣지 않는다 (의미 보존 > 압축률)
 */
(function (root) {
  "use strict";

  // 의미를 바꿀 수 있어 절대 건드리지 않는 단어 (안전장치)
  var PROTECTED = ["반드시", "절대", "항상", "최소", "최대", "금지", "필수", "꼭", "거리"];

  // 규칙: [정규식, 대체, 설명]. 긴 패턴이 먼저 와야 짧은 패턴에 먹히지 않음.
  // 경계 없는 어미는 (?=[\s,.!?]|$) 로 끝을 확인해 단어 중간 오탐을 막는다.
  // ※ 아래 규칙은 모두 실제 토크나이저(o200k_base)로 "토큰이 실제로 줄어듦"을 검증해
  //   채택한 것만 포함. 글자만 짧아지고 토큰이 늘거나 그대로인 표현(예: "수정해주세요→
  //   수정할 것")은 의도적으로 제외했다. 새 규칙 추가 시에도 반드시 토큰 측정 후 채택할 것.
  var RAW = [
    // ── 정중 요청구 (긴 것 먼저) ──
    ["해\\s*주시기\\s*바랍니다", "할 것", "정중 요청 → 간결"],
    ["하여\\s*주시기\\s*바랍니다", "할 것", "정중 요청 → 간결"],
    ["하시기\\s*바랍니다", "할 것", "정중 요청 → 간결"],
    ["해\\s*주시면\\s*감사하겠습니다", " 요망", "정중 요청 → 간결"],
    ["주시면\\s*감사하겠습니다", " 요망", "정중 요청 → 간결"],
    ["해\\s*주실\\s*수\\s*있나요", " 요망", "정중 요청 → 간결"],
    ["해\\s*주실\\s*수\\s*있을까요", " 요망", "정중 요청 → 간결"],
    ["해\\s*주시겠어요", " 요망", "정중 요청 → 간결"],
    ["해\\s*주시겠습니까", " 요망", "정중 요청 → 간결"],
    ["도와주시겠어요", "요망", "정중 요청 → 간결"],
    ["도와주실\\s*수\\s*있나요", "요망", "정중 요청 → 간결"],
    ["도와주세요", "요망", "정중 요청 → 간결"],
    ["부탁드려요", "요망", "정중 요청 → 간결"],
    ["해\\s*주시고", "하고", "요청 어미 축약"],
    ["해\\s*주시며", "하며", "요청 어미 축약"],
    ["(?<=[가-힣])해\\s*주시기\\s*바라요", "", "요청 제거(명사형)"],
    ["(?<=[가-힣])해\\s*주세요", "", "요청 제거 → 명사형(토큰 절감)"],
    ["(?<=[가-힣])해\\s*줘(?=[\\s,.!?]|$)", "", "요청 제거 → 명사형(토큰 절감)"],
    // ── 금지 ──
    ["하지\\s*말아\\s*주세요", "하지 말 것", "금지 어미 축약"],
    ["하지\\s*마세요", "하지 말 것", "금지 어미 축약"],
    ["하면\\s*안\\s*됩니다", " 금지", "금지 → 간결"],
    // ── 장황 서술/명사구 ──
    ["최우선으로\\s*생각합니다", "우선시함", "장황 서술 축약"],
    ["최우선으로\\s*합니다", "우선시함", "장황 서술 축약"],
    ["하는\\s*것이\\s*좋습니다", " 권장", "장황 서술 축약"],
    ["하는\\s*것이\\s*바람직합니다", "할 것", "장황 서술 축약"],
    ["하는\\s*편이\\s*좋습니다", " 권장", "장황 서술 축약"],
    ["할\\s*필요가\\s*있습니다", " 필요함", "장황 서술 축약"],
    ["할\\s*필요가\\s*있는\\s*상황입니다", " 필요함", "장황 서술 축약"],
    ["가\\s*필요한\\s*상황입니다", " 필요함", "장황 서술 축약"],
    ["할\\s*여지가\\s*있습니다", " 여지 있음", "장황 서술 축약"],
    ["가능성이\\s*있습니다", "수 있음", "장황 서술 축약"],
    ["될\\s*수\\s*있습니다", "될 수 있음", "장황 서술 축약"],
    ["에\\s*대해서(?=\\s)", "을", "장황 조사구 축약"],
    ["에\\s*대한(?=\\s)", "", "장황 조사구 축약"],
    ["와\\s*관련된(?=\\s)", "", "장황 조사구 축약"],
    ["과\\s*관련된(?=\\s)", "", "장황 조사구 축약"],
    // ── 정중 요청/의뢰 ──
    ["해\\s*주실\\s*수\\s*있으실까요", "할 것", "정중 요청 → 간결"],
    ["부탁드리겠습니다", " 요망", "정중 요청 → 간결"],
    ["부탁드립니다", " 요망", "정중 요청 → 간결"],
    ["주시면\\s*좋겠습니다", " 요망", "정중 요청 → 간결"],
    // ── 도입/접속 군더더기 (구문) ──
    ["결론적으로\\s*말씀드리면", "결론:", "도입 군더더기 축약"],
    ["다시\\s*말해서", "즉,", "도입 군더더기 축약"],
    ["아시다시피", "", "도입 군더더기 제거"],
    ["앞서\\s*말씀드린\\s*바와\\s*같이", "앞서 말한 대로", "장황 도입 축약"],
    ["다음과\\s*같은\\s*방식으로", "다음과 같이", "장황 표현 축약"],
    // ── 정중 어미 (하도록 하겠습니다 류) ──
    ["하도록\\s*하겠습니다(?=[\\s,.!?]|$)", "함", "어미 축약"],
    ["해\\s*보도록\\s*하겠습니다(?=[\\s,.!?]|$)", "함", "어미 축약"],
    ["드리도록\\s*하겠습니다(?=[\\s,.!?]|$)", "겠음", "어미 축약"],
    ["드리겠습니다(?=[\\s,.!?]|$)", "함", "어미 축약"],
    ["하겠습니다(?=[\\s,.!?]|$)", "함", "어미 축약"],
    ["입니다(?=[\\s,.!?]|$)", "임", "개조식 어미"],
    ["습니다(?=[\\s,.!?]|$)", "음", "개조식 어미"],
    ["됩니다(?=[\\s,.!?]|$)", "됨", "개조식 어미"],
    ["합니다(?=[\\s,.!?]|$)", "함", "개조식 어미"]
  ];

  // 단독으로 쓰일 때만 삭제하는 군더더기 부사/접속어 (앞뒤가 한글이 아닐 때만).
  // 모두 토큰 절감 검증 완료. '반드시/절대' 등 의미를 바꾸는 어휘는 PROTECTED로 보호.
  var FILLERS = ["만약", "또한", "혹시", "매우", "정말", "정말로", "아주", "굉장히",
                 "기본적으로", "일반적으로", "개인적으로", "사실상",
                 "그리고", "그래서", "따라서", "그러므로", "아무튼", "일단",
                 "좀", "한번"];

  function isProtected(s) {
    for (var i = 0; i < PROTECTED.length; i++) if (s.indexOf(PROTECTED[i]) !== -1) return true;
    return false;
  }

  // 텍스트에서 적용 가능한 제안 목록을 찾는다 (겹치지 않게, 앞에서부터)
  function findSuggestions(text) {
    var hits = [];
    // 1) 어구 치환
    RAW.forEach(function (r) {
      var re = new RegExp(r[0], "g");
      var m;
      while ((m = re.exec(text)) !== null) {
        hits.push({ start: m.index, end: m.index + m[0].length, before: m[0], after: r[1], note: r[2] });
        if (m.index === re.lastIndex) re.lastIndex++;
      }
    });
    // 2) 군더더기 부사 제거 (단독일 때만)
    FILLERS.forEach(function (f) {
      var re = new RegExp("(?<![가-힣])" + f + "(?![가-힣])[ ,]*", "g");
      var m;
      while ((m = re.exec(text)) !== null) {
        hits.push({ start: m.index, end: m.index + m[0].length, before: f, after: "", note: "불필요 부사 제거", removed: m[0] });
        if (m.index === re.lastIndex) re.lastIndex++;
      }
    });
    // 보호 단어 포함 제안 제거 + 겹침 해소 (시작 위치 오름차순, 같은 위치면 긴 것 우선)
    hits = hits.filter(function (h) { return !isProtected(h.before); });
    hits.sort(function (a, b) { return a.start - b.start || (b.end - b.start) - (a.end - a.start); });
    var out = [], lastEnd = -1;
    hits.forEach(function (h) { if (h.start >= lastEnd) { out.push(h); lastEnd = h.end; } });
    return out;
  }

  // 제안 하나를 텍스트에 적용
  function applyOne(text, sug) {
    var rep = sug.removed != null ? sug.removed : sug.before;
    var after = sug.after;
    // 부사 제거 시 뒤 공백/쉼표까지 같이 지움(removed에 포함). 일반 치환은 before->after.
    return text.slice(0, sug.start) + after + text.slice(sug.start + rep.length);
  }

  // 인접 반복 구 제거: 1~3어절짜리 구가 바로 뒤에 똑같이 반복되면 한 번만 남긴다.
  // "검토 검토 해줘"→"검토 해줘", "이 코드를 이 코드를"→"이 코드를".
  // 강조성 반복(하나 하나, 많이 많이 등)은 의미가 바뀌므로 보호한다.
  var DUP_PROTECT = ["하나", "둘", "셋", "많이", "조금", "빨리", "빠르게", "천천히",
                     "점점", "자주", "가끔", "때때로", "더", "덜", "쭉", "계속", "또"];
  function dedupAdjacent(text) {
    var w = text.split(/\s+/).filter(Boolean);
    var out = [], i = 0;
    while (i < w.length) {
      var removed = false;
      for (var n = 3; n >= 1; n--) {
        if (i + 2 * n <= w.length) {
          var seg1 = w.slice(i, i + n).join(" ");
          var seg2 = w.slice(i + n, i + 2 * n).join(" ");
          if (seg1 === seg2) {
            if (n === 1 && DUP_PROTECT.indexOf(w[i]) !== -1) continue; // 강조 반복 보호
            for (var k = 0; k < n; k++) out.push(w[i + k]);
            i += 2 * n; removed = true; break;
          }
        }
      }
      if (!removed) { out.push(w[i]); i++; }
    }
    return out.join(" ");
  }

  // 모든 제안 적용
  function applyAll(text) {
    var changes = [];
    var loops = 0;
    while (loops++ < 50) {
      var sugs = findSuggestions(text);
      if (!sugs.length) break;
      // 뒤에서부터 적용해 인덱스 밀림 방지
      for (var i = sugs.length - 1; i >= 0; i--) {
        text = applyOne(text, sugs[i]);
        changes.push(sugs[i]);
      }
    }
    text = dedupAdjacent(text); // 인접 반복 구 제거 (마지막 단계)
    text = text.replace(/\s+([,.!?])/g, "$1").replace(/\s{2,}/g, " ").trim();
    return { text: text, changes: changes };
  }

  // 토큰 수: js-tiktoken 번들(window.KORC_TIK)이 로드돼 있으면 실측, 없으면 글자 기반 추정.
  function estimateTokens(text) {
    if (typeof window !== "undefined" && window.KORC_TIK && window.KORC_TIK.ready) {
      try { return window.KORC_TIK.count(text); } catch (e) { /* 폴백 */ }
    }
    var ko = 0, other = 0;
    for (var i = 0; i < text.length; i++) {
      var c = text.charCodeAt(i);
      if (c >= 0xac00 && c <= 0xd7a3) ko++; else if (text[i].trim()) other++;
    }
    return Math.max(1, Math.round(ko * 0.71 + other * 0.25));
  }

  // 실측 토크나이저 사용 가능 여부 (UI에서 '추정' vs 정확 표시 구분용)
  function isExact() {
    return typeof window !== "undefined" && window.KORC_TIK && window.KORC_TIK.ready === true;
  }

  // 단어별 토큰 분해: 공백 기준으로 나눠 각 단어의 추정 토큰 수를 반환.
  // [{word, tokens}] 형태. UI에서 단어별로 토큰 비용을 시각화하는 데 사용.
  function tokenBreakdown(text) {
    var parts = (text || "").split(/(\s+)/); // 공백도 보존
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      var w = parts[i];
      if (w === "" || /^\s+$/.test(w)) continue;
      out.push({ word: w, tokens: estimateTokens(w) });
    }
    return out;
  }

  var api = { findSuggestions: findSuggestions, applyOne: applyOne, applyAll: applyAll,
              estimateTokens: estimateTokens, tokenBreakdown: tokenBreakdown, isExact: isExact };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.KORC = api;
})(typeof window !== "undefined" ? window : globalThis);
