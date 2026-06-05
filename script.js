function pad2(number) {
  return String(number).padStart(2, "0");
}

function getSlideFromUrl(max) {
  const params = new URLSearchParams(window.location.search);
  const slide = Number(params.get("slide"));
  if (!Number.isFinite(slide) || slide < 1 || slide > max) return 1;
  return slide;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

let suppressNextClick = false;

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

function addElasticDrag(target) {
  if (!target) return;

  let isPointerDown = false;
  let startX = 0;
  let startY = 0;
  let moved = false;

  function setTranslate(x, y) {
    target.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  function resetPosition() {
    target.classList.remove("is-dragging");
    target.style.transform = "translate3d(0, 0, 0)";
  }

  target.addEventListener("pointerdown", (event) => {
    isPointerDown = true;
    moved = false;
    startX = event.clientX;
    startY = event.clientY;

    target.classList.add("is-dragging");

    if (target.setPointerCapture) {
      target.setPointerCapture(event.pointerId);
    }
  });

  target.addEventListener("pointermove", (event) => {
    if (!isPointerDown) return;

    const rawX = event.clientX - startX;
    const rawY = event.clientY - startY;

    if (Math.abs(rawX) > 4 || Math.abs(rawY) > 4) {
      moved = true;
      suppressNextClick = true;
    }

    const x = clamp(rawX * 0.28, -30, 30);
    const y = clamp(rawY * 0.2, -20, 20);

    setTranslate(x, y);
  });

  target.addEventListener("pointerup", (event) => {
    isPointerDown = false;

    if (target.releasePointerCapture) {
      try {
        target.releasePointerCapture(event.pointerId);
      } catch (error) {
        // ignore
      }
    }

    resetPosition();

    if (moved) {
      window.setTimeout(() => {
        suppressNextClick = false;
      }, 140);
    }
  });

  target.addEventListener("pointercancel", () => {
    isPointerDown = false;
    resetPosition();

    window.setTimeout(() => {
      suppressNextClick = false;
    }, 140);
  });
}

function setupTopImage() {
  const current = document.getElementById("top-current");
  const topPage = document.querySelector(".top-page");
  const topImage =
    document.getElementById("top-image-button") ||
    document.querySelector(".top-image");

  if (!topPage || !current) return;

  const max = 12;
  let index = getSlideFromUrl(max);

  function render() {
    current.textContent = pad2(index);
  }

  function nextImage() {
    index = index >= max ? 1 : index + 1;
    render();
  }

  function prevImage() {
    index = index <= 1 ? max : index - 1;
    render();
  }

  document.addEventListener("click", (event) => {
    if (!topPage.contains(event.target)) return;
    if (event.target.closest("a")) return;

    if (suppressNextClick) {
      event.preventDefault();
      event.stopPropagation();
      suppressNextClick = false;
      return;
    }

    const centerX = window.innerWidth / 2;

    if (event.clientX >= centerX) {
      nextImage();
    } else {
      prevImage();
    }
  });

  addSwipeControl(topPage, nextImage, prevImage);
  addElasticDrag(topImage);

  render();
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

  const initialDpr = window.devicePixelRatio || 1;

  function updateCursorScale() {
    const currentDpr = window.devicePixelRatio || 1;
    const scale = initialDpr / currentDpr;
    cursor.style.setProperty("--cursor-scale", String(scale));
  }

  function moveCursor(event) {
    const isLink = event.target.closest("a");

    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;

    updateCursorScale();

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
  window.addEventListener("resize", updateCursorScale);

  updateCursorScale();
}

setupTopImage();
setupBookImage();
setupCustomCursor();
