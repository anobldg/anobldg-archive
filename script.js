const slides = [
  {
    title: "展示風景",
    label: "Exhibition",
    src: "images/slide-01.jpg",
    description: "展覧会「アノビルのこと」の記録より。"
  },
  {
    title: "1/20模型",
    label: "Model",
    src: "images/slide-02.jpg",
    description: "建築のかたちを検討するための模型。"
  },
  {
    title: "1/100模型",
    label: "Study Model",
    src: "images/slide-03.jpg",
    description: "街と建築の関係を読むためのスタディ。"
  },
  {
    title: "断片から全体へ",
    label: "Fragment",
    src: "images/slide-04.jpg",
    description: "ファサードや窓、細部から全体を考える。"
  },
  {
    title: "抽象化への探求",
    label: "Abstraction",
    src: "images/slide-05.jpg",
    description: "第一期の展示テーマ。"
  },
  {
    title: "横山町とアノビル",
    label: "Yokoyamacho",
    src: "images/slide-06.jpg",
    description: "東京・日本橋横山町を舞台にしたリサーチ。"
  },
  {
    title: "読む建築展",
    label: "Reading Architecture",
    src: "images/slide-07.jpg",
    description: "建築を読むための対象として捉え直す展示。"
  },
  {
    title: "アーカイブブック",
    label: "Archive Book",
    src: "images/slide-08.jpg",
    description: "展示、模型、ドローイング、テキストの記録。"
  }
];

let currentIndex = 0;

const slideImage = document.querySelector("[data-slide-image]");
const slideButton = document.querySelector("[data-slide-button]");
const slideCount = document.querySelector("[data-slide-count]");
const slideTitle = document.querySelector("[data-slide-title]");
const slideLabel = document.querySelector("[data-slide-label]");
const slideDescription = document.querySelector("[data-slide-description]");
const prevButton = document.querySelector("[data-prev]");
const nextButton = document.querySelector("[data-next]");
const infoLink = document.querySelector("[data-info-link]");
const informationLink = document.querySelector("[data-information-link]");

function renderSlide() {
  const slide = slides[currentIndex];

  slideImage.classList.remove("is-missing");
  slideImage.src = slide.src;
  slideImage.alt = slide.title;
  slideCount.textContent = `${currentIndex + 1}/${slides.length}`;
  slideTitle.textContent = slide.title;
  slideLabel.textContent = slide.label;
  slideDescription.textContent = slide.description;
}

function nextSlide() {
  currentIndex = (currentIndex + 1) % slides.length;
  renderSlide();
}

function prevSlide() {
  currentIndex = (currentIndex - 1 + slides.length) % slides.length;
  renderSlide();
}

function scrollToTarget(event, selector) {
  event.preventDefault();
  document.querySelector(selector).scrollIntoView({ behavior: "smooth" });
}

slideImage.addEventListener("error", () => {
  slideImage.classList.add("is-missing");
});

slideButton.addEventListener("click", nextSlide);
nextButton.addEventListener("click", nextSlide);
prevButton.addEventListener("click", prevSlide);

infoLink.addEventListener("click", (event) => {
  scrollToTarget(event, "#info");
});

informationLink.addEventListener("click", (event) => {
  scrollToTarget(event, "#information");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    nextSlide();
  }

  if (event.key === "ArrowLeft") {
    prevSlide();
  }
});

renderSlide();
