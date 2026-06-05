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

      if (Math.abs(diffX) < 45) return;
      if (Math.abs(diffX) <= Math.abs(diffY)) return;

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
  const topPage = document.querySelector("body.top-page");
  const topImage =
    document.getElementById("top-image-button") ||
    document.querySelector(".top-image");

  if (!topPage || !topImage || !current) return;

  const max = 12;
  let index = getSlideFromUrl(max);
  let isAnimating = false;
  let wheelLock = false;

  topImage.innerHTML = "";

  function syncPanel(panel) {
    const rect = topImage.getBoundingClientRect();

    panel.style.setProperty("--slide-left", `${rect.left + rect.width / 2}px`);
    panel.style.setProperty("--slide-top", `${rect.top + rect.height / 2}px`);
    panel.style.setProperty("--slide-width", `${rect.width}px`);
    panel.style.setProperty("--slide-height", `${rect.height}px`);
  }

  function createPanel() {
    const panel = document.createElement("div");
    panel.className = "slide-panel";
    panel.textContent = "top image";
    syncPanel(panel);
    document.body.appendChild(panel);
    return panel;
  }

  let activePanel = createPanel();
  activePanel.classList.add("is-current");

  function renderCounter() {
    current.textContent = pad2(index);
  }

  function changeImage(direction) {
    if (isAnimating) return;

    isAnimating = true;

    const oldPanel = activePanel;
    const newPanel = createPanel();

    syncPanel(oldPanel);
    syncPanel(newPanel);

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
      syncPanel(newPanel);
      isAnimating = false;
    }, 880);
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
      if (event.target.closest("a")) return;
      if (isAnimating || wheelLock) return;

      const absX = Math.abs(event.deltaX);
      const absY = Math.abs(event.deltaY);
      const mainDelta = absX > absY ? event.deltaX : event.deltaY;

      if (Math.abs(mainDelta) < 18) return;

      event.preventDefault();
      wheelLock = true;

      if (mainDelta > 0) {
        nextImage();
      } else {
        prevImage();
      }

      window.setTimeout(() => {
        wheelLock = false;
      }, 900);
    },
    { passive: false }
  );

  window.addEventListener("resize", () => {
    syncPanel(activePanel);
  });

  addSwipeControl(topPage, nextImage, prevImage);
  renderCounter();
}

function setupBookImage() {
  const button = document.getElementById("book-image-button");
  const current = document.getElementById("book-current");

  if (!button || !current) return;

  const max = 6;
  let index = 1;

  function render() {
    current.textContent = String(index);
  }

  function nextImage() {
    index = index >= max ? 1 : index + 1;
    render();
  }

  function prevImage() {
    index = index <= 1 ? max : index - 1;
    render();
  }

  button.addEventListener("click", (event) => {
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;

    if (event.clientX >= centerX) {
      nextImage();
    } else {
      prevImage();
    }
  });

  addSwipeControl(button, nextImage, prevImage);
  render();
}

function setupCustomCursor() {
  const topPage = document.querySelector("body.top-page");
  if (!topPage) return;

  let cursor = document.querySelector(".custom-cursor");

  if (!cursor) {
    cursor = document.createElement("div");
    cursor.className = "custom-cursor";
    cursor.setAttribute("aria-hidden", "true");
    document.body.appendChild(cursor);
  }

  function moveCursor(event) {
    const isLink = event.target.closest("a");

    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;

    if (isLink) {
      cursor.classList.remove("is-visible", "is-left", "is-right");
      cursor.classList.add("is-hidden-on-link");
      return;
    }

    cursor.classList.add("is-visible");
    cursor.classList.remove("is-hidden-on-link");

    if (event.clientX < window.innerWidth / 2) {
      cursor.classList.add("is-left");
      cursor.classList.remove("is-right");
    } else {
      cursor.classList.add("is-right");
      cursor.classList.remove("is-left");
    }
  }

  function hideCursor() {
    cursor.classList.remove("is-visible");
  }

  document.addEventListener("mousemove", moveCursor);
  document.addEventListener("mouseleave", hideCursor);
}

setupTopImage();
setupBookImage();
setupCustomCursor();
