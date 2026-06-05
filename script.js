function pad2(number) {
  return String(number).padStart(2, "0");
}

function getSlideFromUrl(max) {
  const params = new URLSearchParams(window.location.search);
  const slide = Number(params.get("slide"));
  if (!Number.isFinite(slide) || slide < 1 || slide > max) return 1;
  return slide;
}

function addSwipeControl(target, onNext, onPrev) {
  if (!target) return;

  let startX = 0;
  let startY = 0;

  target.addEventListener(
    "touchstart",
    (event) => {
      if (!event.touches || event.touches.length === 0) return;

      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    },
    { passive: true }
  );

  target.addEventListener(
    "touchend",
    (event) => {
      if (!event.changedTouches || event.changedTouches.length === 0) return;

      const endX = event.changedTouches[0].clientX;
      const endY = event.changedTouches[0].clientY;

      const diffX = endX - startX;
      const diffY = endY - startY;

      const minSwipeDistance = 45;
      const isHorizontalSwipe = Math.abs(diffX) > Math.abs(diffY);

      if (!isHorizontalSwipe) return;
      if (Math.abs(diffX) < minSwipeDistance) return;

      if (diffX < 0) {
        onNext();
      } else {
        onPrev();
      }
    },
    { passive: true }
  );
}

function setupTopImage() {
  const current = document.getElementById("top-current");
  const topPage = document.querySelector(".top-page");
  const topImage =
    document.getElementById("top-image-button") ||
    document.querySelector(".top-image");

  if (!topPage || !topImage || !current) return;

  const max = 12;
  let index = getSlideFromUrl(max);
  let isAnimating = false;

  topImage.innerHTML = "";

  function syncSlidePosition(panel) {
    const rect = topImage.getBoundingClientRect();

    panel.style.setProperty("--slide-left", `${rect.left + rect.width / 2}px`);
    panel.style.setProperty("--slide-top", `${rect.top + rect.height / 2}px`);
    panel.style.setProperty("--slide-width", `${rect.width}px`);
    panel.style.setProperty("--slide-height", `${rect.height}px`);
  }

  let activePanel = document.createElement("div");
  activePanel.className = "slide-panel is-current";
  activePanel.textContent = "top image";
  document.body.appendChild(activePanel);
  syncSlidePosition(activePanel);

  function renderCounter() {
    current.textContent = pad2(index);
  }

  function changeImage(direction) {
    if (isAnimating) return;

    isAnimating = true;

    const oldPanel = activePanel;
    const newPanel = document.createElement("div");

    newPanel.className = "slide-panel";
    newPanel.textContent = "top image";

    document.body.appendChild(newPanel);
    syncSlidePosition(oldPanel);
    syncSlidePosition(newPanel);

    if (direction === "next") {
      index = index >= max ? 1 : index + 1;

      newPanel.classList.add("enter-from-left");
      oldPanel.classList.remove("is-current");
      oldPanel.classList.add("exit-to-right");
    } else {
      index = index <= 1 ? max : index - 1;

      newPanel.classList.add("enter-from-right");
      oldPanel.classList.remove("is-current");
      oldPanel.classList.add("exit-to-left");
    }

    activePanel = newPanel;
    renderCounter();

    window.setTimeout(() => {
      oldPanel.remove();
      newPanel.className = "slide-panel is-current";
      syncSlidePosition(newPanel);
      isAnimating = false;
    }, 820);
  }

  function nextImage() {
    changeImage("next");
  }

  function prevImage() {
    changeImage("prev");
  }

  document.addEventListener("click", (event) => {
    if (!topPage.contains(event.target)) return;
    if (event.target.closest("a")) return;

    const centerX = window.innerWidth / 2;

    if (event.clientX >= centerX) {
      nextImage();
    } else {
      prevImage();
    }
  });

  topPage.addEventListener(
    "wheel",
    (event) => {
      if (isAnimating) return;
      if (event.target.closest("a")) return;

      const absX = Math.abs(event.deltaX);
      const absY = Math.abs(event.deltaY);
      const mainDelta = absX > absY ? event.deltaX : event.deltaY;

      if (Math.abs(mainDelta) < 18) return;

      event.preventDefault();

      if (mainDelta > 0) {
        nextImage();
      } else {
        prevImage();
      }
    },
    { passive: false }
  );

  window.addEventListener("resize", () => {
    syncSlidePosition(activePanel);
  });

  addSwipeControl(topPage, nextImage, prevImage);

  renderCounter();
}
