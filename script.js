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

    const centerX = window.innerWidth / 2;

    if (event.clientX >= centerX) {
      nextImage();
    } else {
      prevImage();
    }
  });

  addSwipeControl(topPage, nextImage, prevImage);

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
