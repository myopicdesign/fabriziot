/***********************
 * FORM_ENDPOINT
 ***********************/
const FORM_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbw2BWkNpueif2Myy0odSraxu9srG2ZGT3s_HB_RMtWVs31bf-ob5ITv6bq2pXxSH3CPNg/exec";

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

    $scope.cardDestroyed = (i) => $scope.cards.splice(i, 1);

    $scope.addCard = () =>
      $scope.cards.unshift(
        angular.copy(cardTypes[Math.floor(Math.random() * cardTypes.length)])
      );

    $scope.cardSwipedLeft = $scope.addCard;
    $scope.cardSwipedRight = $scope.addCard;

    $scope.openCard = (c) => c?.image && openLightbox(c.image);
  });

/***********************
 * EMOJI ROTARY SLIDER (APPROVATO - COMPLETO con DRAG + SNAP)
 ***********************/
(function initEmojiRotary() {
  const angleStage = document.getElementById("angleStage");
  const angleList = document.getElementById("angleList");
  const centerLabelEl = document.getElementById("centerLabel");
  if (!angleStage || !angleList || !centerLabelEl) return;

  const base = [...angleList.querySelectorAll(".angleItem")];

  // usa gli stessi dataset del tuo HTML (se ci sono), altrimenti fallback
  const dragRatio = Number(angleList.dataset.dragSpeedRatio || 0.16);
  const speed = Number(angleList.dataset.speed || 380);
  const stepDeg = 26;

  let offset = 0;
  let down = false;
  let startX = 0;
  let lastX = 0;
  let snapping = false;

  const layout = () => {
    const w = angleStage.clientWidth;
    const cx = w / 2;
    const cy = 106;
    const radius = Math.min(270, Math.max(205, w * 0.72));

    let best = null;

    base.forEach((el, i) => {
      const idxCentered = i - Math.floor(base.length / 2);
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

    base.forEach((el) => el.classList.remove("is-active"));
    if (best) {
      best.el.classList.add("is-active");
      centerLabelEl.textContent = best.el.dataset.label || "";
    }
  };

  const setDefault = (label) => {
    const idx = base.findIndex((el) => (el.dataset.label || "") === label);
    if (idx >= 0) {
      const idxCentered = idx - Math.floor(base.length / 2);
      offset = -(idxCentered * stepDeg);
    }
  };

  // default come prima: Forte
  setDefault("Forte");
  layout();
  window.addEventListener("resize", layout);

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
 * Progress ring sul bottone (compilazione campi)
 ***********************/
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
const requiredEls = requiredIds
  .map((id) => document.getElementById(id))
  .filter(Boolean);

function isFilled(el) {
  return ((el.value || "") + "").trim().length > 0;
}

function updateProgress() {
  const filled = requiredEls.reduce(
    (acc, el) => acc + (isFilled(el) ? 1 : 0),
    0
  );
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
 * SUBMIT → GOOGLE APPS SCRIPT (FORM POST senza CORS)
 * - usa un form "vero" per evitare preflight/CORS su GitHub Pages
 * - lo Script deve leggere e.parameter (form-urlencoded) o JSON (se lo supporti)
 ***********************/
if (submitBtn) {
  submitBtn.addEventListener("click", () => {
    // reset status UI
    if (statusEl) {
      statusEl.textContent = "";
      statusEl.className = "status";
    }

    // blocco se non completo (progress ring)
    updateProgress();
    if (submitBtn.disabled) {
      if (statusEl) {
        statusEl.textContent = "Compila tutti i campi prima di inviare.";
        statusEl.classList.add("err");
      }
      return;
    }

    // prendi valori
    const nameEl = document.getElementById("name");
    const companyEl = document.getElementById("company");
    const sectorEl = document.getElementById("sector");
    const budgetEl = document.getElementById("budget");
    const needEl = document.getElementById("need");
    const emailEl = document.getElementById("email");
    const centerLabel = document.getElementById("centerLabel");

    const fields = {
      name: (nameEl?.value || "").trim(),
      company: (companyEl?.value || "").trim(),
      sector: (sectorEl?.value || "").trim(),
      brand: (centerLabel?.textContent || "").trim(),
      budget: (budgetEl?.value || "").trim(),
      need: (needEl?.value || "").trim(),
      email: (emailEl?.value || "").trim(),
    };

    // validazione email base
    if (!/^\S+@\S+\.\S+$/.test(fields.email)) {
      if (statusEl) {
        statusEl.textContent = "Email non valida.";
        statusEl.classList.add("err");
      }
      return;
    }

    // invio via form post (no CORS, nessun fetch)
    const form = document.createElement("form");
    form.method = "POST";
    form.action = FORM_ENDPOINT;
    form.target = "_self"; // resta sulla pagina (Apps Script risponde JSON/testo)

    // IMPORTANTISSIMO: forza form-urlencoded
    form.enctype = "application/x-www-form-urlencoded";

    for (const key in fields) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = fields[key];
      form.appendChild(input);
    }

    document.body.appendChild(form);

    // UI feedback (non possiamo leggere response senza CORS)
    submitBtn.disabled = true;
    if (statusEl) {
      statusEl.textContent = "Invio in corso...";
      statusEl.classList.remove("err");
      statusEl.classList.remove("ok");
    }

    form.submit();
  });
}
