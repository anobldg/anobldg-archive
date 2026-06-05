const slides = [
  {
    title: "A Temporary Order",
    image: "images/slide-01.jpg",
    note: "A structural study of a minimal slideshow page."
  },
  {
    title: "Image and Information",
    image: "images/slide-02.jpg",
    note: "The slide number, title, note, and image update together."
  },
  {
    title: "Click to Advance",
    image: "images/slide-03.jpg",
    note: "The main image area works as the primary navigation."
  },
  {
    title: "Black Background",
    image: "images/slide-04.jpg",
    note: "This is a dark structural mockup, not a copied design asset."
  },
  {
    title: "Temporary Site",
    image: "images/slide-05.jpg",
    note: "The page is intentionally sparse."
  },
  {
    title: "Publication Link",
    image: "images/slide-06.jpg",
    note: "Buy Now moves to the product structure page."
  },
  {
    title: "Information",
    image: "images/slide-07.jpg",
    note: "Information remains in the page, not in a modal."
  },
  {
    title: "Return",
    image: "images/slide-08.jpg",
    note: "The sequence loops back to the first slide."
  }
];

let current = 0;

const count = document.getElementById("slide-count");
const title = document.getElementById("slide-title");
const note = document.getElementById("slide-note");
const img = document.getElementById("slide-img");
const placeholder = document.getElementById("placeholder");
const hitarea = document.getElementById("slide-hitarea");
const prev = document.getElementById("prev");
const next = document.getElementById("next");

function showPlaceholder() {
  img.hidden = true;
  placeholder.hidden = false;
}

function showImage() {
  img.hidden = false;
  placeholder.hidden = true;
}

function render() {
  const s = slides[current];
  count.textContent = `${current + 1}/${slides.length}`;
  title.textContent = s.title;
  note.textContent = s.note;
  img.onload = showImage;
  img.onerror = showPlaceholder;
  img.src = s.image;
  img.alt = s.title;
}

function goNext() {
  current = (current + 1) % slides.length;
  render();
}

function goPrev() {
  current = (current - 1 + slides.length) % slides.length;
  render();
}

hitarea.addEventListener("click", goNext);
hitarea.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    goNext();
  }
});

prev.addEventListener("click", (event) => {
  event.preventDefault();
  goPrev();
});

next.addEventListener("click", (event) => {
  event.preventDefault();
  goNext();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") goNext();
  if (event.key === "ArrowLeft") goPrev();
});

render();
