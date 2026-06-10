const PURCHASE_URL = "#";
const DATA_URL = "data/images.json";
const DATA_VERSION = "20260610-phase2-2-1-archive-copy-frame-fix";
const DEBUG_TEXT = false;

const ARCHIVE_CONTENT = {
  ja: {
    title: "アノビルのこと　アーカイブブック",
    price: "¥5,000",
    priceNote: "限定 20 部。税込・送料込み。",
    button: "購入する",
    description: "建築展「アノビルのこと」の展示記録をまとめたアーカイブブック。横山町でのリサーチ、図面、テキストを改めて制作し直し、展示会写真と共に収録しています。\n\n編集・企画：大塚史奈、喜井雅治\nデザイン：平川航太\n写真・撮影協力：大塚紫乃\n\n発行日：2026 年 5 月〇〇日\nA4 判変形 210×210mm / 104項",
    credit: ""
  },
  en: {
    title: "Ano Building Archive Book",
    price: "¥5,000",
    priceNote: "Limited to 20 copies　Tax / shipping included",
    button: "purchase",
    description: "An archive book documenting the architecture exhibition “Ano Building.”\nIt includes newly reworked research, drawings, and texts from Yokoyama-cho, together with photographs of the exhibition.\n\nEditing / Planning: Fumina Otsuka, Masaharu Kii\nDesign: Kota Hirakawa\nPhotography: Shino Otsuka\n\nPublication Date: May 00, 2026\nModified A4 Format, 210 × 210 mm / 104 pages",
    credit: ""
  }
};

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
  mediaWarmCache: new Map(),
  currentTextGroup: "",
  currentTextLang: "",
  currentTitleKey: "",
  currentArchiveGroup: null,
  currentArchiveLang: "",
  mediaWarmTokens: new Map(),
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
      "Ano Building<br>An Exhibition of Drawings and Models",
      "Special Thanks:<br>Hiroshi Tomikawa Architects & Associates<br>Hiroshi Tomikawa",
      "Model Production Support:<br>Yuki Sato, Haruki Fukushima, Akari Nozu, Shinnosuke Adachi, Kyota Yotsuji, Ryo Shibata, Kota Katori, Kiminori Nakashima, Yoshino Sasaki, Yusuke Sasaki, Nano Sato, Norihisa Nagata, Sora Hashimoto, Saki Matsumoto, Shoki Yasue, Takuto Yoshida",
      "Instagram:<br><a href=\"https://www.instagram.com/ano_bldg/\" target=\"_blank\" rel=\"noreferrer\">@ano_bldg</a><br><a href=\"https://www.instagram.com/_mimi._.23/\" target=\"_blank\" rel=\"noreferrer\">@_mimi._.23</a><br><a href=\"https://www.instagram.com/masaharukii/\" target=\"_blank\" rel=\"noreferrer\">@masaharukii</a>",
      "Contact:<br><a href=\"mailto:mshr.tmkii@gmail.com\">mshr.tmkii@gmail.com</a>"
    ].map((text) => `<p>${text}</p>`).join("")
  },
};

const els = {};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  collectElements();
  bindEvents();

  try {
    const response = await fetch(withDataVersion(DATA_URL));
    if (!response.ok) throw new Error(`Could not load ${DATA_URL}`);
    state.data = await response.json();
  } catch (error) {
    console.error(error);
    state.data = { anoBuilding: [], exhibition: [] };
  }

  renderAll({ immediate: true });
  scheduleWarmAdjacent("anoBuilding", state.indexes.anoBuilding);
  scheduleWarmAdjacent("exhibition", state.indexes.exhibition);
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
  els.archivePriceNote = document.querySelector('[data-bind="archivePriceNote"]');
  els.archiveDescription = document.querySelector('[data-bind="archiveDescription"]');
  els.archiveCredit = document.querySelector('[data-bind="archiveCredit"]');
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

  const prevItem = items[current];
  const nextItem = items[next];
  state.indexes[gallery] = next;
  animateStage(gallery, nextItem, direction);
  scheduleWarmAdjacent(gallery, next);

  if (gallery === "anoBuilding") {
    fadeUpdate([document.querySelector('[data-role="ano-caption"]')], () => renderAnoCaption());
  } else {
    const nextTextGroup = getTextGroup(nextItem);
    const isSameTextGroup = nextTextGroup && nextTextGroup === state.currentTextGroup && state.lang === state.currentTextLang;
    const nextTitleKey = getTitleKey(nextItem);
    const isSameTitle = nextTitleKey && nextTitleKey === state.currentTitleKey;
    const prevArchiveGroup = getArchiveGroup(prevItem);
    const nextArchiveGroup = getArchiveGroup(nextItem);
    const isSameArchiveGroup = prevArchiveGroup === nextArchiveGroup && state.lang === state.currentArchiveLang;
    const targets = [els.currentCount];

    if (!isSameTitle) {
      targets.push(els.exhibitionTitle);
    }

    if (!isSameTextGroup) {
      targets.push(document.querySelector('[data-role="exhibition-copy"]'));
    }

    if (!isSameArchiveGroup) {
      targets.push(els.archivePanel);
    }

    fadeUpdate(targets, () => renderExhibitionDetails({ keepText: isSameTextGroup, keepArchive: isSameArchiveGroup }));
  }
}

function animateStage(gallery, nextItem, direction) {
  const stage = els.stages[gallery];
  const incomingMedia = stage.querySelector('[data-role="incoming-image"]');
  const className = direction > 0 ? "is-next" : "is-prev";

  state.isAnimating = true;
  setStageMedia(stage, "incoming-image", nextItem);
  const incomingImage = stage.querySelector('[data-role="incoming-image"]');
  incomingImage.style.transform = `translateX(${direction > 0 ? 100 : -100}%)`;
  incomingImage.getBoundingClientRect();
  stage.classList.add(className);

  window.setTimeout(() => {
    setStageMedia(stage, "current-image", nextItem);
    clearStageMedia(stage, "incoming-image", incomingMedia);
    stage.classList.remove(className);
    cleanupStageMedia(stage);
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
  setStageMedia(els.stages[gallery], "current-image", item);
  cleanupStageMedia(els.stages[gallery]);
  scheduleWarmAdjacent(gallery, state.indexes[gallery]);
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
  state.currentTitleKey = item ? getTitleKey(item) : "";
  els.currentCount.textContent = total ? pad2(current) : "00";
  els.totalCount.textContent = total ? ` | ${pad2(total)}` : " | 00";
  els.exhibitionInfo.innerHTML = COPY.exhibitionInfo[state.lang];

  if (!options.keepArchive) renderArchive(item);

  if (!item) {
    els.exhibitionText.textContent = "";
    state.currentTextGroup = "";
    state.currentTextLang = "";
    return;
  }

  const nextTextGroup = getTextGroup(item);
  if (options.keepText && nextTextGroup === state.currentTextGroup && state.lang === state.currentTextLang) return;

  state.currentTextGroup = nextTextGroup;
  state.currentTextLang = state.lang;
  els.exhibitionText.textContent = await loadText(item);
}

function renderArchive(item) {
  const shouldShow = item && isArchiveItem(item);
  const archive = ARCHIVE_CONTENT[state.lang];

  els.archiveTitle.textContent = archive.title;
  els.archivePrice.textContent = archive.price;
  els.archivePriceNote.textContent = archive.priceNote;
  els.archiveDescription.textContent = archive.description;
  els.archiveDescription.hidden = !archive.description;
  els.archiveCredit.textContent = archive.credit;
  els.archiveCredit.hidden = !archive.credit;
  els.purchaseButton.textContent = archive.button;
  els.purchaseButton.href = PURCHASE_URL;
  state.currentArchiveGroup = shouldShow ? getArchiveGroup(item) : null;
  state.currentArchiveLang = state.lang;

  if (shouldShow) {
    requestAnimationFrame(() => els.archivePanel.classList.remove("is-hidden"));
  } else {
    els.archivePanel.classList.add("is-hidden");
  }
}

async function loadText(item) {
  const path = getTextPath(item, state.lang);
  logArchiveTextCheck(item, path);
  if (!path) return "Text file not found.";

  try {
    return normalizeText(await fetchText(path, item, state.lang));
  } catch (error) {
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

function getCurrentItem(gallery) {
  const items = state.data[gallery] || [];
  return items[state.indexes[gallery]] || null;
}

function getTitle(item) {
  const key = state.lang === "ja" ? "titleJa" : "titleEn";
  return item[key] || fallbackName(item.src).title;
}

function getTitleKey(item) {
  if (!item) return "";
  return `${state.lang}:${item.titleJa || ""}:${item.titleEn || ""}`;
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

function getArchiveGroup(item) {
  if (!item || !isArchiveItem(item)) return null;
  return item.archiveGroup || "ano-building-archive";
}

function getTextGroup(item) {
  if (!item) return "";
  return item.textGroup || item.textJa || item.textEn || "";
}

function getTextPath(item, lang) {
  const group = item.textGroup ? state.data.texts?.[item.textGroup] : null;

  if (group) {
    return lang === "en"
      ? group.en || item.textEn || ""
      : group.ja || item.textJa || "";
  }

  return lang === "en"
    ? item.textEn || ""
    : item.textJa || "";
}

async function fetchText(path, item, lang) {
  const versionedPath = withDataVersion(path);
  if (state.textCache.has(versionedPath)) return state.textCache.get(versionedPath);

  try {
    const response = await fetch(versionedPath);
    if (!response.ok) {
      console.warn("[text fetch failed]", {
        id: item.id,
        titleJa: item.titleJa,
        archive: item.archive,
        archiveGroup: item.archiveGroup,
        textGroup: item.textGroup,
        lang,
        path,
        status: response.status
      });
      throw new Error(`Text fetch failed: ${response.status} ${path}`);
    }

    const text = await response.text();
    state.textCache.set(versionedPath, text);
    return text;
  } catch (error) {
    if (!error.message.startsWith("Text fetch failed:")) {
      console.warn("[text fetch failed]", {
        id: item.id,
        titleJa: item.titleJa,
        archive: item.archive,
        archiveGroup: item.archiveGroup,
        textGroup: item.textGroup,
        lang,
        path,
        status: null,
        error
      });
    }
    throw error;
  }
}

function normalizeText(raw) {
  return String(raw || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
}

function withDataVersion(path) {
  if (!path) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}v=${DATA_VERSION}`;
}

function logArchiveTextCheck(item, resolvedPath) {
  if (!DEBUG_TEXT || !item?.archive) return;
  console.info("[archive text debug]", {
    id: item.id,
    textGroup: item.textGroup,
    textJa: item.textJa,
    textEn: item.textEn,
    resolvedPath,
    language: state.lang
  });
}

function setStageMedia(stage, role, item) {
  const previous = stage.querySelector(`[data-role="${role}"]`);
  const media = createMediaElement(item);
  media.dataset.role = role;
  media.classList.add(role === "current-image" ? "current" : "incoming");
  if (role === "current-image" || role === "incoming-image") {
    media.classList.add("is-current");
  }
  if (role === "incoming-image") {
    const current = stage.querySelector('[data-role="current-image"]');
    current?.classList.remove("is-current");
    current?.classList.add("is-leaving");
  }
  pauseMedia(previous);
  previous.replaceWith(media);
}

function clearStageMedia(stage, role, fallback) {
  const current = stage.querySelector(`[data-role="${role}"]`);
  pauseMedia(current);

  const media = fallback || document.createElement("img");
  media.className = `stage-image ${role === "current-image" ? "current" : "incoming"} is-broken is-error`;
  media.dataset.role = role;
  media.alt = "";
  media.style.transform = "";
  current.replaceWith(media);
}

function createMediaElement(item) {
  if (!item || !item.src) {
    const image = document.createElement("img");
    image.alt = "";
    image.className = "stage-image is-broken is-error";
    return image;
  }

  if (item.type === "video") {
    const video = document.createElement("video");
    video.src = item.src;
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.setAttribute("playsinline", "");
    video.className = "stage-image stage-media is-loaded";
    video.addEventListener("canplay", () => playVideo(video, item.src));
    requestAnimationFrame(() => playVideo(video, item.src));
    return video;
  }

  if (item.type && item.type !== "image" && item.type !== "svg") {
    console.warn(`Unsupported exhibition media type "${item.type}" for ${item.src}`);
  }

  const image = document.createElement("img");
  image.alt = item.titleJa || item.titleEn || "";
  image.decoding = "async";
  image.className = "stage-image stage-media";
  image.addEventListener("load", () => {
    image.classList.add("is-loaded");
    image.classList.remove("is-broken", "is-error");
  });
  image.addEventListener("error", () => {
    console.warn("[media load failed]", item.id, item.src);
    image.remove();
  });
  image.src = item.src;
  if (image.complete && image.naturalWidth > 0) {
    image.classList.add("is-loaded");
  }
  return image;
}

function scheduleWarmAdjacent(gallery, index) {
  const list = state.data[gallery];
  if (!Array.isArray(list) || !list.length) return;
  const token = Symbol(gallery);
  state.mediaWarmTokens.set(gallery, token);

  const run = () => {
    if (state.mediaWarmTokens.get(gallery) !== token) return;
    warmMedia(list[index]);
    warmMedia(list[wrapIndex(index - 1, list.length)]);
    warmMedia(list[wrapIndex(index + 1, list.length)]);
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(run);
  } else {
    window.setTimeout(run, 300);
  }
}

function warmMedia(item) {
  if (!item || !item.src || state.mediaWarmCache.has(item.src)) return;

  if (item.type === "video") {
    const video = document.createElement("video");
    video.src = item.src;
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    state.mediaWarmCache.set(item.src, video);
    return;
  }

  const image = new Image();
  image.src = item.src;
  state.mediaWarmCache.set(item.src, image);
}

function cleanupStageMedia(stage) {
  if (!stage) return;

  const medias = Array.from(stage.querySelectorAll(".stage-media"));
  medias.forEach((media) => {
    if (!media.classList.contains("is-current")) {
      pauseMedia(media);
      media.remove();
    }
  });

  const currents = Array.from(stage.querySelectorAll(".stage-media.is-current"));
  if (currents.length > 1) {
    currents.slice(0, -1).forEach((media) => {
      pauseMedia(media);
      media.remove();
    });
  }
}

function pauseMedia(media) {
  if (media?.tagName === "VIDEO") {
    media.pause();
  }
}

function playVideo(video, src) {
  video.play().catch((error) => {
    console.warn("[video autoplay failed]", src, error);
  });
}

function wrapIndex(index, length) {
  return (index + length) % length;
}

function pad2(number) {
  return String(number).padStart(2, "0");
}
