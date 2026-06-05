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
  const button = document.getElementById("top-image-button");
  const current = document.getElementById("top-current");
  if (!button || !current) return;

  const max = 12;
  let index = getSlideFromUrl(max);

  function render() {
    current.textContent = pad2(index);
  }

  button.addEventListener("click", () => {
    index = index >= max ? 1 : index + 1;
    render();
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

  button.addEventListener("click", () => {
    index = index >= max ? 1 : index + 1;
    render();
  });

  render();
}

setupTopImage();
setupBookImage();
