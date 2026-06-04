const bookImages = Array.from(document.querySelectorAll("[data-book-image]"));
const bookFrames = Array.from(document.querySelectorAll("[data-book-frame]"));
const bookCount = document.querySelector("[data-book-count]");

bookImages.forEach((image) => {
  image.addEventListener("error", () => {
    image.classList.add("is-missing");
  });
});

function setBookCount(index) {
  bookCount.textContent = `${index + 1} of ${bookImages.length}`;
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visibleEntry) {
        setBookCount(bookFrames.indexOf(visibleEntry.target));
      }
    },
    { threshold: [0.25, 0.5, 0.75] }
  );

  bookFrames.forEach((frame) => {
    observer.observe(frame);
  });
}

setBookCount(0);
