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
  let endX = 0;
  let endY = 0;

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

      endX = event.changedTouches[0].clientX;
      endY = event.changedTouches[0].clientY;

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
  let wheelTimer = null;

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

    const x = clamp(rawX * 0.32, -34, 34);
    const y = clamp(rawY * 0.24, -24, 24);

    setTranslate(x, y);
  });

  target.addEventListener("pointerup", (event) => {
    isPointerDown = false;

    if (target.releasePointerCapture) {
      try {
        target.releasePointerCapture(event.pointerId);
      } catch (error) {
        // pointer capture may already be released
      }
    }

    resetPosition();

    if (moved) {
      window.setTimeout(() => {
        suppressNextClick = false;
      }, 120);
    }
  });

  target.addEventListener("pointercancel", () => {
    isPointerDown = false;
    resetPosition();

    window.setTimeout(() => {
      suppressNextClick = false;
    }, 120);
  });

  target.addEventListener(
    "wheel",
    (event) => {
      const deltaX = clamp(-event.deltaX * 0.12, -28, 28);
      const deltaY = clamp(-event.deltaY * 0.08, -18, 18);

      if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) return;

      suppressNextClick = true;
      target.classList.add("is-dragging");
      setTranslate(deltaX, deltaY);

      window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => {
        resetPosition();
        suppressNextClick = false;
      }, 90);
    },
    { passive: true }
  );
}

function setupTopImage() {
  
  function setupDirectionalCursor(topPage) {
  if (!topPage) return;

  function updateCursor(event) {
    const centerX = window.innerWidth / 2;

    if (event.clientX >= centerX) {
      topPage.classList.add("cursor-right");
      topPage.classList.remove("cursor-left");
    } else {
      topPage.classList.add("cursor-left");
      topPage.classList.remove("cursor-right");
    }
  }

  document.addEventListener("mousemove", updateCursor);

  topPage.classList.add("cursor-right");
}
  const current = document.getElementById("top-current");
  const topPage = document.querySelector(".top-page");
  const topImage = document.getElementById("top-image-button");

  if (!topPage || !current) return;

　setupDirectionalCursor(topPage);
  
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

setupTopImage();
setupBookImage();
