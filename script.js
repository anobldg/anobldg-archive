const slides = [
  {
    src: "images/slide-01.jpg",
    alt: "展示風景",
    caption: "展示風景",
    label: "Exhibition"
  },
  {
    src: "images/slide-02.jpg",
    alt: "1/20模型",
    caption: "1/20模型",
    label: "Model"
  },
  {
    src: "images/slide-03.jpg",
    alt: "1/100模型",
    caption: "1/100模型",
    label: "Study Model"
  },
  {
    src: "images/slide-04.jpg",
    alt: "断片から全体へ",
    caption: "断片から全体へ",
    label: "Fragment"
  },
  {
    src: "images/slide-05.jpg",
    alt: "抽象化への探求",
    caption: "抽象化への探求",
    label: "Abstraction"
  },
  {
    src: "images/slide-06.jpg",
    alt: "横山町とアノビル",
    caption: "横山町とアノビル",
    label: "Yokoyamacho"
  },
  {
    src: "images/slide-07.jpg",
    alt: "読む建築展",
    caption: "読む建築展",
    label: "Reading Architecture"
  },
  {
    src: "images/slide-08.jpg",
    alt: "アーカイブブック",
    caption: "アーカイブブック",
    label: "Archive Book"
  }
];

const image = document.querySelector("[data-slide-image]");
const count = document.querySelector("[data-slide-count]");
const caption = document.querySelector("[data-slide-caption]");
const label = document.querySelector("[data-slide-label]");
const imageButton = document.querySelector(".slide-image");
const prevButton = document.querySelector("[data-prev]");
const nextButton = document.querySelector("[data-next]");

let currentIndex = 0;

// Keep all visible slide text in sync with the current image.
function showSlide(index) {
  currentIndex = (index + slides.length) % slides.length;
  const slide = slides[currentIndex];

  image.classList.remove("is-missing");
  image.src = slide.src;
  image.alt = slide.alt;
  count.textContent = `${currentIndex + 1}/${slides.length}`;
  caption.textContent = slide.caption;
  label.textContent = slide.label;
}

function moveSlide(direction) {
  showSlide(currentIndex + direction);
}

// Missing images should leave the quiet placeholder frame intact.
image.addEventListener("error", () => {
  image.classList.add("is-missing");
});

imageButton.addEventListener("click", () => {
  moveSlide(1);
});

prevButton.addEventListener("click", () => {
  moveSlide(-1);
});

nextButton.addEventListener("click", () => {
  moveSlide(1);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    moveSlide(-1);
  }

  if (event.key === "ArrowRight") {
    moveSlide(1);
  }
});

showSlide(currentIndex);
