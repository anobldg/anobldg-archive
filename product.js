const blocks = document.querySelectorAll(".product-image");
const counter = document.getElementById("product-count");

blocks.forEach((block, index) => {
  const src = block.dataset.src;
  const img = new Image();

  img.onload = () => {
    block.classList.add("has-image");
    img.alt = `Product image ${index + 1}`;
    block.appendChild(img);
  };

  img.onerror = () => {
    block.classList.remove("has-image");
  };

  img.src = src;
});

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    const index = Array.from(blocks).indexOf(visible.target);
    counter.textContent = `${index + 1} of ${blocks.length}`;
  },
  { threshold: [0.35, 0.6, 0.85] }
);

blocks.forEach((block) => observer.observe(block));
