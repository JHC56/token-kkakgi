"use strict";
/* claude.ai 전용 한국어 교정 (단순화 버전)
 * 입력창 포커스 시 우상단에 초록 배지 -> 클릭하면 제안 카드 -> 개별/모두 적용.
 * write-back은 contenteditable(ProseMirror) 대응으로 execCommand 사용(README 참고).
 */
(function () {
  var K = window.KORC;
  if (!K) return;

  var SEL = 'div[contenteditable="true"], textarea';
  var ed = null, badge = null, card = null, open = false, sugs = [];

  function text() {
    var t = ed.tagName === "TEXTAREA" ? ed.value : ed.innerText;
    // ProseMirror는 문단마다 줄바꿈을 넣음 -> 연속 줄바꿈/끝 공백 정규화
    return (t || "").replace(/\u00a0/g, " ").replace(/\n{2,}/g, "\n").replace(/[ \t]+\n/g, "\n");
  }

  function write(s) {
    s = s.replace(/\n{2,}/g, "\n").replace(/\s+$/g, "");  // 빈 줄 방지
    if (ed.tagName === "TEXTAREA") {
      var d = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value");
      d.set.call(ed, s);
      ed.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }
    ed.focus();
    // 전체 선택 후 교체. execCommand('selectAll')이 ProseMirror에서 빈 문단을 덜 남김.
    document.execCommand("selectAll", false, null);
    document.execCommand("insertText", false, s);
  }

  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function make() {
    badge = document.createElement("div");
    badge.className = "korc-badge";
    badge.dataset.korc = "1";
    badge.title = "드래그로 이동 · 클릭으로 열기";
    enableBadgeDrag();

    card = document.createElement("div");
    card.className = "korc-card";
    card.dataset.korc = "1";
    card.onmousedown = function (e) { e.preventDefault(); };

    document.body.appendChild(badge);
    document.body.appendChild(card);
  }

  // 배지: 드래그로 이동, 짧게 누르면 클릭(열기/닫기)
  var badgePos = null; // 사용자가 옮긴 배지 위치 {left, top}
  function enableBadgeDrag() {
    var down = null, moved = false;
    badge.addEventListener("mousedown", function (e) {
      e.preventDefault();
      var r = badge.getBoundingClientRect();
      down = { x: e.clientX, y: e.clientY, offX: e.clientX - r.left, offY: e.clientY - r.top };
      moved = false;
      function mv(ev) {
        if (Math.abs(ev.clientX - down.x) + Math.abs(ev.clientY - down.y) > 4) moved = true;
        if (moved) {
          badgePos = { left: ev.clientX - down.offX, top: ev.clientY - down.offY };
          badge.style.left = Math.round(Math.min(Math.max(4, badgePos.left), innerWidth - 36)) + "px";
          badge.style.top = Math.round(Math.min(Math.max(4, badgePos.top), innerHeight - 36)) + "px";
          if (card.classList.contains("korc-open")) place();
        }
      }
      function up() {
        document.removeEventListener("mousemove", mv);
        document.removeEventListener("mouseup", up);
        if (!moved) { open = !open; if (!open) dragPos = null; draw(); } // 이동 안 했으면 클릭으로 처리
      }
      document.addEventListener("mousemove", mv);
      document.addEventListener("mouseup", up);
    });
  }

  function draw() {
    var t = text();
    sugs = t.trim() ? K.findSuggestions(t) : [];
    var now = t.trim() ? K.estimateTokens(t) : 0;
    var aft = sugs.length ? K.estimateTokens(K.applyAll(t).text) : now;
    var pct = now ? Math.round((now - aft) / now * 100) : 0;
    var clean = sugs.length === 0;

    badge.innerHTML = clean ? "&#10003;" : String(sugs.length);
    badge.classList.toggle("korc-clean", clean);
    if (clean) open = false;

    if (open && sugs.length) {
      var bd = K.tokenBreakdown(t);
      var bdHtml = bd.map(function (w) {
        var cls = w.tokens >= 4 ? "korc-w korc-w3" : (w.tokens >= 2 ? "korc-w korc-w2" : "korc-w");
        return '<span class="' + cls + '">' + esc(w.word) +
          '<sub>' + w.tokens + '</sub></span>';
      }).join("");
      card.innerHTML =
        '<div class="korc-head" data-drag="1"><span class="korc-grip">&#8942;&#8942;</span>' +
        '<b>다듬기 제안 ' + sugs.length + '곳</b>' +
        '<span class="korc-save" title="전체 토큰 수는 시스템 토큰 등으로 실제와 다를 수 있습니다">' + now + '&#8594;' + aft + 't (추정) · -' + pct + '%</span></div>' +
        '<div class="korc-list">' + sugs.map(function (s, i) {
          return '<div class="korc-item"><div class="korc-t"><s>' + esc(s.before) + '</s> &#8594; ' +
            '<b>' + (s.after ? esc(s.after) : '<i>삭제</i>') + '</b>' +
            '<span class="korc-n">' + esc(s.note) + '</span></div>' +
            '<button data-i="' + i + '" type="button">적용</button></div>';
        }).join("") + '</div>' +
        '<div class="korc-bd-title">단어별 토큰 <span>(숫자 = 단어 단독 추정, 문맥상 합과 다를 수 있음)</span></div>' +
        '<div class="korc-bd">' + bdHtml + '</div>' +
        '<button class="korc-all" type="button">모두 적용</button>';
      card.classList.add("korc-open");
      card.querySelectorAll(".korc-item button").forEach(function (b) {
        b.onclick = function () { write(K.applyOne(text(), sugs[+b.dataset.i])); setTimeout(draw, 40); };
      });
      card.querySelector(".korc-all").onclick = function () { write(K.applyAll(text()).text); setTimeout(draw, 40); };
      enableDrag();
    } else {
      card.classList.remove("korc-open");
    }
    place();
  }

  var dragPos = null; // 사용자가 직접 옮기면 {left, top} 저장

  function place() {
    var r = ed.getBoundingClientRect();
    if (!badgePos) {
      badge.style.left = Math.round(r.right - 38) + "px";
      badge.style.top = Math.round(r.top + 8) + "px";
    }
    if (!card.classList.contains("korc-open")) return;

    if (dragPos) { // 사용자가 옮긴 위치를 우선 사용 (화면 안으로만 보정)
      var cw = card.offsetWidth || 320, ch = card.offsetHeight || 160;
      card.style.left = Math.round(Math.min(Math.max(8, dragPos.left), innerWidth - cw - 8)) + "px";
      card.style.top = Math.round(Math.min(Math.max(8, dragPos.top), innerHeight - ch - 8)) + "px";
      return;
    }

    var h = card.offsetHeight || 160;
    var left = Math.max(8, Math.min(r.right - 320, innerWidth - 328));
    // 입력창 위 공간이 충분하면 위로, 아니면 아래로 — 어느 쪽이든 화면 안에 들어오게
    var top = r.top - h - 10;
    if (top < 8) top = Math.min(r.bottom + 10, innerHeight - h - 8);
    if (top < 8) top = 8;
    card.style.left = Math.round(left) + "px";
    card.style.top = Math.round(top) + "px";
  }

  function enableDrag() {
    var head = card.querySelector('[data-drag]');
    if (!head) return;
    head.style.cursor = "move";
    head.onmousedown = function (e) {
      e.preventDefault();
      var rect = card.getBoundingClientRect();
      var offX = e.clientX - rect.left, offY = e.clientY - rect.top;
      function move(ev) {
        dragPos = { left: ev.clientX - offX, top: ev.clientY - offY };
        place();
      }
      function up() {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      }
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    };
  }

  function shown() { return badge && badge.classList.contains("korc-on"); }

  document.addEventListener("focusin", function (e) {
    if (e.target.closest && e.target.closest("[data-korc]")) return;
    var el = e.target.closest && e.target.closest(SEL);
    if (el) { ed = el; if (!badge) make(); badge.classList.add("korc-on"); draw(); }
  });
  document.addEventListener("mousedown", function (e) {
    if (!badge || (e.target.closest && e.target.closest("[data-korc]"))) return;
    if (ed && ed.contains(e.target)) return;
    badge.classList.remove("korc-on"); card.classList.remove("korc-open"); open = false;
  });
  document.addEventListener("input", function (e) {
    if (shown() && ed && (e.target === ed || ed.contains(e.target))) draw();
  }, true);
  addEventListener("scroll", function () { if (shown()) place(); }, true);
  addEventListener("resize", function () { if (shown()) place(); });
})();
