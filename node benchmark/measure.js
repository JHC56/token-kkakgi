// 측정 스크립트 — 확장이 실제로 쓰는 rules.js와 tiktoken 번들을 그대로 사용한다.
// 재현: node benchmark/measure.js
//
// rules.js는 브라우저용(window.KORC에 노출)이라, window를 모킹해 로드한다.
global.window = {};
require("../extension/tiktoken.bundle.js"); // window.KORC_TIK 노출 (o200k_base 실측)
const K = require("../extension/rules.js");  // window.KORC = 규칙 엔진
const corpus = require("./corpus.js");

const tok = (s) => window.KORC_TIK.count(s);

let totalBefore = 0, totalAfter = 0;
let covered = 0, reduced = 0, unchanged = 0, increased = 0;

for (const s of corpus) {
  const out = K.applyAll(s).text;
  const b = tok(s), a = tok(out);
  totalBefore += b; totalAfter += a;
  if (K.findSuggestions(s).length > 0) covered++;
  if (a < b) reduced++; else if (a === b) unchanged++; else increased++;
}

const pct = ((totalBefore - totalAfter) / totalBefore * 100);
console.log("=== token-kkakgi 효과 측정 (문어체 지시문 " + corpus.length + "문장) ===");
console.log("토크나이저  : o200k_base (GPT-4o 계열, js-tiktoken 실측)");
console.log("커버리지     : " + covered + "/" + corpus.length +
            " (" + Math.round(covered / corpus.length * 100) + "%)");
console.log("총 토큰      : " + totalBefore + " -> " + totalAfter);
console.log("평균 절감률  : " + pct.toFixed(1) + "%");
console.log("문장 분포    : 줆 " + reduced + " · 동일 " + unchanged + " · 늚 " + increased);
