const PURCHASE_URL = "#";
const DATA_URL = "data/images.json";

const state = {
  page: "anoBuilding",
  lang: "ja",
  indexes: {
    anoBuilding: 0,
    exhibition: 0
  },
  data: {
    anoBuilding: [],
    exhibition: []
  },
  textCache: new Map(),
  currentTextGroup: "",
  isAnimating: false
};

const COPY = {
  heading: {
    ja: "アノビルのこと",
    en: "Ano Building"
  },
  exhibitionInfo: {
    ja: [
      "アノビルのこと<br>ドローイングと模型による建築展",
      "開催期間：2025年7月22日 - 10月4日<br>企画・展示：大塚史奈、喜井雅治",
      "特別協力（企画・展示・会場提供）：<br>合同会社冨川浩史建築設計事務所／冨川浩史",
      "模型制作協力：<br>佐藤優希、福島陽貴、野津明梨、安達慎之助、四辻響太、芝田 諒、香取洸太、中島旺紀、佐々木佳乃、佐々木悠輔、佐藤菜乃、永田典久、橋本颯良、松本紗季、安江将輝、吉田拓人",
      "Instagram:<br><a href=\"https://www.instagram.com/ano_bldg/\" target=\"_blank\" rel=\"noreferrer\">@ano_bldg</a><br><a href=\"https://www.instagram.com/_mimi._.23/\" target=\"_blank\" rel=\"noreferrer\">@_mimi._.23</a><br><a href=\"https://www.instagram.com/masaharukii/\" target=\"_blank\" rel=\"noreferrer\">@masaharukii</a>",
      "連絡先：<br><a href=\"mailto:mshr.tmkii@gmail.com\">mshr.tmkii@gmail.com</a>"
    ].map((text) => `<p>${text}</p>`).join(""),
    en: [
      "ANO Building<br>An Exhibition of Drawings and Models",
      "Special Thanks:<br>Hiroshi Tomikawa Architects & Associates<br>Hiroshi Tomikawa",
      "Model Production Support:<br>Yuki Sato, Haruki Fukushima, Akari Nozu, Shinnosuke Adachi, Kyota Yotsuji, Ryo Shibata, Kota Katori, Kiminori Nakashima, Yoshino Sasaki, Yusuke Sasaki, Nano Sato, Norihisa Nagata, Sora Hashimoto, Saki Matsumoto, Shoki Yasue, Takuto Yoshida",
      "Instagram:<br><a href=\"https://www.instagram.com/ano_bldg/\" target=\"_blank\" rel=\"noreferrer\">@ano_bldg</a><br><a href=\"https://www.instagram.com/_mimi._.23/\" target=\"_blank\" rel=\"noreferrer\">@_mimi._.23</a><br><a href=\"https://www.instagram.com/masaharukii/\" target=\"_blank\" rel=\"noreferrer\">@masaharukii</a>",
      "Contact:<br><a href=\"mailto:mshr.tmkii@gmail.com\">mshr.tmkii@gmail.com</a>"
    ].map((text) => `<p>${text}</p>`).join("")
  },
  archive: {
    ja: {
      title: "アノビルのこと　アーカイブブック",
      price: "¥5,000",
      description: "建築展「アノビルのこと」の展示記録をまとめたアーカイブブックです。横山町でのリサーチ、図面、模型写真、展示テキストを収録しています。\n210×210mm、約104ページ。限定20部。税込・送料込み。\n\n編集・企画：大塚史奈、喜井雅治\nデザイン：平川航太\n写真・撮影協力：大塚紫乃\n発行日：2026年5月〇〇日\nA4判変形 210×210mm / 〇〇頁 /",
      button: "購入する"
    },
    en: {
      title: "Ano Building Archive Book",
      price: "¥5,000",
      description: "An archive book documenting the architecture exhibition “Ano Building.”\nIt includes research conducted in Yokoyamacho, drawings, model photographs, and exhibition texts.\nSpecifications: 210 × 210 mm, approx. 104 pages, limited edition of 20 copies, tax and shipping included.\n\nVenue / Planning: Fumina Otsuka, Masaharu Kii\nDesign: Riku Hirakawa\nText / Editorial Support: Fumina Otsuka\nPublication date: May 00, 2026\nPrice: ¥5,000 / tax and shipping included",
      button: "purchase"
    }
  }
};

const els = {};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  collectElements();
  bindEvents();

  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`Could not load ${DATA_URL}`);
    state.data = await response.json();
  } catch (error) {
    console.error(error);
    state.data = { anoBuilding: [], exhibition: [] };
  }

  preloadImages([...state.data.anoBuilding, ...state.data.exhibition]);
  renderAll({ immediate: true });
}

function collectElements() {
  els.app = document.getElementById("app");
  els.anoView = document.querySelector('[data-view="anoBuilding"]');
  els.exhibitionView = document.querySelector('[data-view="exhibition"]');
  els.langButtons = document.querySelectorAll(".lang-button");
  els.anoHeading = document.querySelector('[data-bind="anoHeading"]');
  els.anoTitle = document.querySelector('[data-bind="anoTitle"]');
  els.anoSubtitle = document.querySelector('[data-bind="anoSubtitle"]');
  els.exhibitionText = document.querySelector('[data-bind="exhibitionText"]');
  els.exhibitionTitle = document.querySelector('[data-bind="exhibitionTitle"]');
  els.currentCount = document.querySelector('[data-bind="currentCount"]');
  els.totalCount = document.querySelector('[data-bind="totalCount"]');
  els.exhibitionInfo = document.querySelector('[data-bind="exhibitionInfo"]');
  els.archivePanel = document.querySelector('[data-role="archive-panel"]');
  els.archiveTitle = document.querySelector('[data-bind="archiveTitle"]');
  els.archivePrice = document.querySelector('[data-bind="archivePrice"]');
  els.archiveDescription = document.querySelector('[data-bind="archiveDescription"]');
  els.purchaseButton = document.querySelector('[data-bind="purchaseButton"]');
  els.stages = {
    anoBuilding: document.querySelector('[data-gallery="anoBuilding"]'),
    exhibition: document.querySelector('[data-gallery="exhibition"]')
  };
}

function bindEvents() {
  document.querySelectorAll('[data-action="show-exhibition"]').forEach((trigger) => {
    trigger.addEventListener("click", () => {
      setPage("exhibition");
    });
  });

  document.querySelector('[data-action="back"]').addEventListener("click", () => {
    setPage("anoBuilding");
  });

  els.langButtons.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.lang));
  });

  Object.entries(els.stages).forEach(([gallery, stage]) => {
    stage.querySelectorAll(".stage-image").forEach((image) => {
      image.addEventListener("load", () => image.classList.remove("is-broken", "is-error"));
      image.addEventListener("error", () => image.classList.add("is-broken", "is-error"));
    });

    stage.addEventListener("click", (event) => {
      const rect = stage.getBoundingClientRect();
      const direction = event.clientX - rect.left >= rect.width / 2 ? 1 : -1;
      changeImage(gallery, direction);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") changeImage(state.page, 1);
    if (event.key === "ArrowLeft") changeImage(state.page, -1);
  });
}

function setPage(page) {
  state.page = page;
  els.app.dataset.page = page;
  els.anoView.classList.toggle("is-active", page === "anoBuilding");
  els.exhibitionView.classList.toggle("is-active", page === "exhibition");
  renderAll();
}

function setLanguage(lang) {
  if (state.lang === lang) return;
  state.lang = lang;
  document.documentElement.lang = lang;
  els.app.dataset.lang = lang;
  els.langButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === lang);
  });
  renderAll();
}

function changeImage(gallery, direction) {
  const items = state.data[gallery] || [];
  if (!items.length || state.isAnimating) return;

  const current = state.indexes[gallery];
  const next = wrapIndex(current + direction, items.length);
  if (current === next) return;

  state.indexes[gallery] = next;
  animateStage(gallery, items[next], direction);

  if (gallery === "anoBuilding") {
    fadeUpdate([document.querySelector('[data-role="ano-caption"]')], () => renderAnoCaption());
  } else {
    const nextTextGroup = getTextGroup(items[next]);
    const isSameTextGroup = nextTextGroup && nextTextGroup === state.currentTextGroup;
    const targets = [els.currentCount];

    if (!isSameTextGroup) {
      targets.push(document.querySelector('[data-role="exhibition-copy"]'), els.archivePanel);
    }

    fadeUpdate(targets, () => renderExhibitionDetails({ keepText: isSameTextGroup }));
  }
}

function animateStage(gallery, nextItem, direction) {
  const stage = els.stages[gallery];
  const currentImage = stage.querySelector('[data-role="current-image"]');
  const incomingImage = stage.querySelector('[data-role="incoming-image"]');
  const className = direction > 0 ? "is-next" : "is-prev";

  state.isAnimating = true;
  warnUnsupportedMedia(nextItem);
  setImage(incomingImage, nextItem.src);
  incomingImage.style.transform = `translateX(${direction > 0 ? 100 : -100}%)`;
  incomingImage.getBoundingClientRect();
  stage.classList.add(className);

  window.setTimeout(() => {
    setImage(currentImage, nextItem.src);
    incomingImage.removeAttribute("src");
    incomingImage.classList.remove("is-broken", "is-error");
    incomingImage.style.transform = "";
    stage.classList.remove(className);
    state.isAnimating = false;
  }, 410);
}

function renderAll(options = {}) {
  els.anoHeading.textContent = COPY.heading[state.lang];
  renderStage("anoBuilding");
  renderStage("exhibition");
  renderAnoCaption();
  renderExhibitionDetails();
}

function renderStage(gallery) {
  const item = getCurrentItem(gallery);
  const image = els.stages[gallery].querySelector('[data-role="current-image"]');
  warnUnsupportedMedia(item);
  setImage(image, item ? item.src : "");
}

function setImage(image, src) {
  image.alt = "";
  image.classList.remove("is-broken", "is-error");

  if (src) {
    image.src = src;
  } else {
    image.removeAttribute("src");
    image.classList.add("is-broken", "is-error");
  }
}

function renderAnoCaption() {
  const item = getCurrentItem("anoBuilding");
  els.anoTitle.textContent = item ? getTitle(item) : "";
  els.anoSubtitle.textContent = item ? getSubtitle(item) : "";
}

async function renderExhibitionDetails(options = {}) {
  const item = getCurrentItem("exhibition");
  const total = state.data.exhibition.length;
  const current = state.indexes.exhibition + 1;

  els.exhibitionTitle.textContent = item ? getTitle(item) : "";
  els.currentCount.textContent = total ? pad2(current) : "00";
  els.totalCount.textContent = total ? ` | ${pad2(total)}` : " | 00";
  els.exhibitionInfo.innerHTML = COPY.exhibitionInfo[state.lang];

  renderArchive(item);

  if (!item) {
    els.exhibitionText.textContent = "";
    state.currentTextGroup = "";
    return;
  }

  const nextTextGroup = getTextGroup(item);
  if (options.keepText && nextTextGroup === state.currentTextGroup) return;

  state.currentTextGroup = nextTextGroup;
  els.exhibitionText.textContent = await loadText(item);
}

function renderArchive(item) {
  const shouldShow = item && isArchiveItem(item);
  const archive = COPY.archive[state.lang];

  els.archiveTitle.textContent = archive.title;
  els.archivePrice.textContent = archive.price;
  els.archiveDescription.textContent = archive.description;
  els.purchaseButton.textContent = archive.button;
  els.purchaseButton.href = PURCHASE_URL;

  if (shouldShow) {
    requestAnimationFrame(() => els.archivePanel.classList.remove("is-hidden"));
  } else {
    els.archivePanel.classList.add("is-hidden");
  }
}

async function loadText(item) {
  const path = state.lang === "ja" ? item.textJa : item.textEn;
  if (!path) return "Text file not found.";
  if (state.textCache.has(path)) return state.textCache.get(path);

  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Missing ${path}`);
    const text = await response.text();
    state.textCache.set(path, text);
    return text;
  } catch (error) {
    console.warn(error);
    return "Text file not found.";
  }
}

function fadeUpdate(targets, update) {
  targets.forEach((target) => {
    if (target && !target.hidden) target.classList.add("is-fading");
  });

  window.setTimeout(async () => {
    await update();
    targets.forEach((target) => {
      if (target && !target.hidden) target.classList.remove("is-fading");
    });
  }, 170);
}

function preloadImages(items) {
  items.forEach((item) => {
    if (item.type && item.type !== "image") return;
    if (!item.src) return;
    const image = new Image();
    image.src = item.src;
  });
}

function getCurrentItem(gallery) {
  const items = state.data[gallery] || [];
  return items[state.indexes[gallery]] || null;
}

function getTitle(item) {
  const key = state.lang === "ja" ? "titleJa" : "titleEn";
  return item[key] || fallbackName(item.src).title;
}

function getSubtitle(item) {
  const key = state.lang === "ja" ? "subtitleJa" : "subtitleEn";
  return item[key] || fallbackName(item.src).subtitle;
}

function fallbackName(src = "") {
  const file = decodeURIComponent(src.split("/").pop() || "");
  const base = file.replace(/\.[^.]+$/, "").replace(/^\d+_/, "");
  const parts = base.split("_").filter(Boolean);
  return {
    title: parts[0] || base,
    subtitle: parts.slice(1).join("\n")
  };
}

function isArchiveItem(item) {
  if (!item) return false;
  if (typeof item.archive === "boolean") return item.archive;
  const src = decodeURIComponent(item.src || "").toLowerCase();
  const jaTitle = (item.titleJa || "").toLowerCase();
  const enTitle = (item.titleEn || "").toLowerCase();
  return src.includes("アノビルアーカイブ") || src.includes("archive") || jaTitle.includes("アノビルアーカイブ") || enTitle.includes("archive");
}

function getTextGroup(item) {
  if (!item) return "";
  return item.textGroup || item.textJa || item.textEn || "";
}

function warnUnsupportedMedia(item) {
  if (!item || !item.type || item.type === "image") return;
  console.warn(`Unsupported exhibition media type "${item.type}" for ${item.src}`);
}

function wrapIndex(index, length) {
  return (index + length) % length;
}

function pad2(number) {
  return String(number).padStart(2, "0");
}
