const imageBlocks = document.querySelectorAll(".book-image");
const countEl = document.getElementById("book-count");
function loadBookImages() {
  imageBlocks.forEach((block, index) => {
    const src = block.dataset.src;
    const img = new Image();
    img.onload = () => { block.classList.add("has-image"); img.alt = block.getAttribute("aria-label") || `Book image ${index + 1}`; block.appendChild(img); };
    img.onerror = () => { block.classList.remove("has-image"); };
    img.src = src;
  });
}
function setupImageCount() {
  if (!countEl) return;
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const index = Array.from(imageBlocks).indexOf(visible.target);
    countEl.textContent = `${index + 1} of ${imageBlocks.length}`;
  }, { threshold: [0.3, 0.55, 0.8] });
  imageBlocks.forEach((block) => observer.observe(block));
}
loadBookImages(); setupImageCount();
