function pad2(number) {
  return String(number).padStart(2, "0");
}

function getSlideFromUrl(max) {
  const params = new URLSearchParams(window.location.search);
  const slide = Number(params.get("slide"));
  if (!Number.isFinite(slide) || slide < 1 || slide > max) return 1;
  return slide;
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
    if (event.target.closest("a")) return;

    const centerX = window.innerWidth / 2;

    if (event.clientX >= centerX) {
      nextImage();
    } else {
      prevImage();
    }
  });

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

  render();
}

setupTopImage();
setupBookImage();
