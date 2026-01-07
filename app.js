/***********************
 * FORM_ENDPOINT
 ***********************/
const FORM_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbwhMzJfHoUG57c4ZCjofw19qCZv-WdQUeO6ZJghrVmETxii08_f7RfR2XwSYKCWv_Q-Fg/exec";

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
 * EMOJI ROTARY SLIDER
 ***********************/
(function initEmojiRotary() {
  const angleStage = document.getElementById("angleStage");
  const angleList = document.getElementById("angleList");
  const centerLabelEl = document.getElementById("centerLabel");
  if (!angleStage || !angleList || !centerLabelEl) return;

  const items = [...angleList.querySelectorAll(".angleItem")];
  const stepDeg = 26;
  let offset = 0;

  const layout = () => {
    const cx = angleStage.clientWidth / 2;
    const cy = 106;
    const radius = 240;

    let best = null;

    items.forEach((el, i) => {
      const a = (i - Math.floor(items.length / 2)) * stepDeg + offset;
      const rad = (a * Math.PI) / 180;

      const x = cx + radius * Math.sin(rad);
      const y = cy + radius * (1 - Math.cos(rad));

      const dist = Math.abs(a);
      const t = clamp(1 - dist / 60, 0, 1);

      el.style.left = x - 33 + "px";
      el.style.top = y - 33 + "px";
      el.style.opacity = 0.25 + t * 0.75;
      el.style.transform = `scale(${0.9 + t * 0.4})`;

      if (!best || dist < best.dist) best = { el, dist };
    });

    if (best) centerLabelEl.textContent = best.el.dataset.label || "";
  };

  layout();
  window.addEventListener("resize", layout);
})();

/***********************
 * SUBMIT → GOOGLE APPS SCRIPT (FORM POST)
 ***********************/
const submitBtn = document.getElementById("submitBtn");
const statusEl = document.getElementById("status");

submitBtn.addEventListener("click", () => {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = FORM_ENDPOINT;

  const fields = {
    name: name.value,
    company: company.value,
    sector: sector.value,
    brand: centerLabel.textContent,
    budget: budget.value,
    need: need.value,
    email: email.value,
  };

  for (const key in fields) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = fields[key];
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
});
