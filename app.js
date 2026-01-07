/***********************
 * FORM_ENDPOINT (GOOGLE APPS SCRIPT WEB APP /exec)
 ***********************/
const FORM_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbxy8L30jPkHV_pqwg1bSuh2sOuagebf8G2KhwoXoJd73fkvFLcFWBWWDmnDaCDyGvk_4A/exec";

/***********************
 * Helpers
 ***********************/
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

/***********************
 * Lightbox
 ***********************/
const lb = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbClose = document.getElementById("lbClose");

if (lbClose) lbClose.onclick = () => lb.classList.remove("open");
if (lb) {
  lb.onclick = (e) => {
    if (e.target === lb) lb.classList.remove("open");
  };
}

function openLightbox(src) {
  if (!lb || !lbImg) return;
  lbImg.src = src;
  lb.classList.add("open");
}

/***********************
 * ANGULAR + IONIC TINDER CARDS
 ***********************/
angular
  .module("starter", ["ionic", "ionic.contrib.ui.tinderCards"])
  .directive("noScroll", function ($document) {
    return {
      restrict: "A",
      link: function () {
        $document.on("touchmove", function (e) {
          e.preventDefault();
        });
      },
    };
  })
  .controller("CardsCtrl", function ($scope) {
    const cardTypes = [
      { image: "assets/img/work1.jpg" },
      { image: "assets/img/work2.jpg" },
      { image: "assets/img/work3.jpg" },
    ];

    $scope.cards = cardTypes.slice();

    $scope.cardDestroyed = function (index) {
      $scope.cards.splice(index, 1);
    };

    $scope.addCard = function () {
      const newCard = cardTypes[Math.floor(Math.random() * cardTypes.length)];
      $scope.cards.unshift(angular.copy(newCard));
    };

    $scope.cardSwipedLeft = function () {
      $scope.addCard();
    };
    $scope.cardSwipedRight = function () {
      $scope.addCard();
    };

    $scope.openCard = function (card) {
      if (card && card.image) openLightbox(card.image);
    };
  });

/***********************
 * EMOJI ROTARY SLIDER (APPROVATO)
 ***********************/
(function initEmojiRotary() {
  const angleStage = document.getElementById("angleStage");
  const angleList = document.getElementById("angleList");
  const centerLabelEl = document.getElementById("centerLabel");
  if (!angleStage || !angleList || !centerLabelEl) return;

  const items = [...angleList.querySelectorAll(".angleItem")];
  const dragRatio = Number(angleList.dataset.dragSpeedRatio || 0.16);
  const speed = Number(angleList.dataset.speed || 380);
  const stepDeg = 26;

  let offset = 0;

  const layout = () => {
    const w = angleStage.clientWidth;
    const cx = w / 2;
    const cy = 106;
    const radius = Math.min(270, Math.max(205, w * 0.72));

    let best = null;

    items.forEach((el, i) => {
      const idxCentered = i - Math.floor(items.length / 2);
      const a = idxCentered * stepDeg + offset;
      const rad = (a * Math.PI) / 180;

      const x = cx + radius * Math.sin(rad);
      const y = cy + radius * (1 - Math.cos(rad));

      const dist = Math.abs(a);
      const t = clamp(1 - dist / (stepDeg * 2.2), 0, 1);
      const opacity = 0.22 + t * 0.78;
      const scale = 0.9 + t * 0.38;

      el.style.left = x - 33 + "px";
      el.style.top = y - 33 + "px";
      el.style.opacity = opacity.toFixed(3);
      el.style.transform = `scale(${scale.toFixed(3)})`;

      if (!best || dist < best.dist) best = { el, dist };
    });

    items.forEach((el) => el.classList.remove("is-active"));
    if (best) {
      best.el.classList.add("is-active");
      centerLabelEl.textContent = best.el.dataset.label || "";
    }
  };

  const setDefault = (label) => {
    const idx = items.findIndex((el) => (el.dataset.label || "") === label);
    if (idx >= 0) {
      const idxCentered = idx - Math.floor(items.length / 2);
      offset = -(idxCentered * stepDeg);
    }
  };

  setDefault("Forte");
  layout();
  window.addEventListener("resize", layout);

  let down = false, startX = 0, lastX = 0;
  let snapping = false;

  const onDown = (e) => {
    down = true;
    angleStage.setPointerCapture(e.pointerId);
    startX = e.clientX;
    lastX = e.clientX;
  };

  const onMove = (e) => {
    if (!down) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;

    offset += -dx * dragRatio;
    layout();

    if (Math.abs(e.clientX - startX) > 10) e.preventDefault?.();
  };

  const snap = () => {
    if (snapping) return;
    snapping = true;

    const mod = ((offset % stepDeg) + stepDeg) % stepDeg;
    const toMinus = mod > stepDeg / 2 ? stepDeg - mod : -mod;

    const from = offset;
    const to = offset + toMinus;

    const t0 = performance.now();
    const dur = speed;
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const tick = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      offset = from + (to - from) * easeOutQuart(t);
      layout();
      if (t < 1) requestAnimationFrame(tick);
      else snapping = false;
    };

    requestAnimationFrame(tick);
  };

  const onUp = () => {
    if (!down) return;
    down = false;
    snap();
  };

  angleStage.addEventListener("pointerdown", onDown);
  angleStage.addEventListener("pointermove", onMove, { passive: false });
  angleStage.addEventListener("pointerup", onUp);
  angleStage.addEventListener("pointercancel", onUp);
})();

/***********************
 * Progress ring + disable submit until filled
 ***********************/
const formEl = document.getElementById("contactForm");
const submitBtn = document.getElementById("submitBtn");
const statusEl = document.getElementById("status");
const ringProg = document.querySelector(".ringProg");

const ringRadius = 52;
const ringCirc = 2 * Math.PI * ringRadius;

if (ringProg) {
  ringProg.style.strokeDasharray = `${ringCirc} ${ringCirc}`;
  ringProg.style.strokeDashoffset = `${ringCirc}`;
}

const requiredIds = ["name", "company", "sector", "budget", "need", "email"];
const requiredEls = requiredIds.map((id) => document.getElementById(id)).filter(Boolean);

function isFilled(el) {
  return ((el.value || "").trim().length > 0);
}

function updateProgress() {
  const filled = requiredEls.reduce((acc, el) => acc + (isFilled(el) ? 1 : 0), 0);
  const total = requiredEls.length;
  const pct = total ? filled / total : 0;

  if (ringProg) ringProg.style.strokeDashoffset = `${ringCirc * (1 - pct)}`;
  if (submitBtn) submitBtn.disabled = filled !== total;
}

requiredEls.forEach((el) => {
  el.addEventListener("input", updateProgress);
  el.addEventListener("change", updateProgress);
});
updateProgress();

/***********************
 * Submit via hidden form + iframe (no redirect)
 ***********************/
function collect() {
  return {
    name: document.getElementById("name")?.value.trim() || "",
    company: document.getElementById("company")?.value.trim() || "",
    sector: document.getElementById("sector")?.value.trim() || "",
    brand: document.getElementById("brandHidden")?.value.trim() || "", // usa hidden aggiornato
    budget: document.getElementById("budget")?.value || "",
    need: document.getElementById("need")?.value.trim() || "",
    email: document.getElementById("email")?.value.trim() || "",
  };
}

function valid(d) {
  if (!d.name || !d.company || !d.sector || !d.brand || !d.budget || !d.need || !d.email) return false;
  if (!/^\S+@\S+\.\S+$/.test(d.email)) return false;
  return true;
}

function clearForm() {
  const ids = ["name", "company", "sector", "need", "email"];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  const budgetEl = document.getElementById("budget");
  if (budgetEl) budgetEl.value = "";

  // reset brand hidden (opzionale)
  const brandHidden = document.getElementById("brandHidden");
  if (brandHidden) brandHidden.value = (document.getElementById("centerLabel")?.textContent || "Forte").trim();
}

function submitViaHiddenForm(d) {
  const iframeName = "hidden_submit_iframe";
  let iframe = document.querySelector(`iframe[name="${iframeName}"]`);
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.name = iframeName;
    iframe.style.display = "none";
    document.body.appendChild(iframe);
  }

  const form = document.createElement("form");
  form.method = "POST";
  form.action = FORM_ENDPOINT;
  form.target = iframeName;

  Object.keys(d).forEach((key) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = d[key] ?? "";
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  setTimeout(() => form.remove(), 500);
}

if (formEl) {
  formEl.addEventListener("submit", (e) => {
    e.preventDefault(); // ✅ non vai sulla pagina Apps Script

    if (statusEl) {
      statusEl.textContent = "";
      statusEl.className = "status";
    }

    const d = collect();

    if (!valid(d)) {
      if (statusEl) {
        statusEl.textContent = "Controlla: manca qualcosa (o email non valida).";
        statusEl.classList.add("err");
      }
      return;
    }

    // blocca click multipli
    if (submitBtn) submitBtn.disabled = true;

    try {
      submitViaHiddenForm(d);

      if (statusEl) {
        statusEl.textContent = "Inviato! ✅ Ti risponderò via mail.";
        statusEl.classList.add("ok");
      }

      clearForm();
      updateProgress(); // ring torna a 0 e bottone torna disabilitato

    } catch (err) {
      if (statusEl) {
        statusEl.textContent = "Errore. Riprova.";
        statusEl.classList.add("err");
      }
      updateProgress();
    }
  });
}
