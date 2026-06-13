const PURCHASE_URL = "#";
const DATA_URL = "data/images.json";
const DATA_VERSION = "20260610-phase4-1-1-slide-lock-scrollbar";
const DEBUG_TEXT = false;
const DEBUG_LOAD = false;
const LOADER_MIN_DISPLAY = 3000;
const LOADER_MAX_DISPLAY = 5000;
const LOADER_FADE_DURATION = 500;
const LOADER_TEXT_FADE_DURATION = 100;
const LOADER_FONT_TIMEOUT = 1000;
const LOADER_ROAD_MIN_VISIBLE_MS = 3000;
const GESTURE_DRAG_START_PX = 20;
const GESTURE_POINTER_COMMIT_PX = 50;
const MEDIA_LOAD_TIMEOUT = 8000;
const BACKGROUND_FADE_LOADER = 500;
const BACKGROUND_FADE_ANO = 2000;
const BACKGROUND_FADE_EXHIBITION = 1500;
const BACKGROUND_LOAD_TIMEOUT = 5000;
const BACKGROUND_WHITE = "__white__";
const LOADER_IMAGE_PATH = "assets/road/road.png";
const BACKGROUND_IMAGES = {
  archive: "assets/back-images/0000_archive.png",
  first: "assets/back-images/0001_first.png",
  second: "assets/back-images/0002_second.png",
  third: "assets/back-images/0003_third.png"
};
const BACKGROUND_IMAGE_LIST = [
  BACKGROUND_IMAGES.archive,
  BACKGROUND_IMAGES.first,
  BACKGROUND_IMAGES.second,
  BACKGROUND_IMAGES.third
];

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
    title: "Ano Bldg Archive Book",
    price: "¥5,000",
    priceNote: "Limited to 20 copies　Tax / shipping included",
    button: "purchase",
    description: "An archive book documenting the architecture exhibition “Ano Bldg.”\nIt includes newly reworked research, drawings, and texts from Yokoyama-cho, together with photographs of the exhibition.\n\nEditing: Fumina Otsuka, Masaharu Kii\nDesign: Kota Hirakawa\nPhotography: Shino Otsuka\n\nPublication Date: May 00, 2026\nModified A4 Format, 210 × 210 mm / 104 pages",
    credit: ""
  }
};

const SEO_META = {
  ja: {
    anoBuilding: {
      title: "アノビルのこと / Ano Bldg",
      description: "建築展「アノビルのこと」の展示記録をまとめたアーカイブサイト。日本橋横山町でのリサーチ、図面、模型、テキスト、展示写真を収録しています。"
    },
    exhibition: {
      title: "展示記録｜アノビルのこと / Ano Bldg Archive",
      description: "建築展「アノビルのこと」の展示写真、テキスト、図面、模型、アーカイブブックの記録をまとめたページです。"
    }
  },
  en: {
    anoBuilding: {
      title: "Ano Bldg Archive",
      description: "Ano Bldg Archive is an archival website documenting the architecture exhibition “Ano Bldg,” including research, drawings, models, texts, and exhibition photographs from Yokoyama-cho."
    },
    exhibition: {
      title: "Exhibition Archive | Ano Bldg",
      description: "An exhibition archive documenting “Ano Bldg” through photographs, texts, drawings, models, and the archive book."
    }
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
  mediaLoadCache: new Map(),
  mediaWarmCache: new Map(),
  backgroundLoadCache: new Map(),
  currentBackgroundPath: "",
  activeBackgroundLayer: 0,
  backgroundRequestId: 0,
  currentTextGroup: "",
  currentTextLang: "",
  currentTextPath: "",
  currentTextContent: "",
  currentTitleKey: "",
  currentArchiveGroup: null,
  currentArchiveLang: "",
  mediaWarmTokens: new Map(),
  isAnimating: false,
  mediaSliding: {
    anoBuilding: false,
    exhibition: false
  },
  gesture: {
    active: null,
    suppressClickUntil: 0
  },
  loaderStartTime: 0,
  loaderVisibleStartTime: 0,
  loaderSkipped: false,
  loaderEntered: false,
  loaderExitStarted: false,
  fontReady: false,
  loaderTextVisible: false,
  loaderMinimumReady: Promise.resolve(),
  loaderTextVisiblePromise: Promise.resolve(),
  loaderImageReadyPromise: Promise.resolve(),
  loaderReadyPromise: Promise.resolve(),
  loaderRoadMinimumReady: Promise.resolve(),
  resolveLoaderMinimum: null,
  resolveLoaderReady: null,
  resolveLoaderRoadMinimum: null,
  anoPreloadPromise: Promise.resolve(),
  textPreloadPromise: Promise.resolve(),
  backgroundPreloadStarted: false
};

const COPY = {
  heading: {
    ja: "アノビルのこと",
    en: "Ano Bldg"
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
      "Ano Bldg<br>An Exhibition of Drawings and Models",
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
  state.loaderStartTime = Date.now();
  logLoad("loader start", 0);
  state.loaderImageReadyPromise = preloadLoaderImage(getLoaderBackgroundPath()).then((result) => {
    if (!result.ok) console.warn("[loader road image unavailable before display]", result);
    return showLoaderText().then(() => result);
  });
  state.loaderReadyPromise = new Promise((resolve) => {
    state.resolveLoaderReady = resolve;
  });
  state.loaderRoadMinimumReady = new Promise((resolve) => {
    state.resolveLoaderRoadMinimum = resolve;
  });
  state.loaderMinimumReady = new Promise((resolve) => {
    state.resolveLoaderMinimum = resolve;
  });
  document.documentElement.dataset.lang = state.lang;
  updateSeoMeta();
  bindEvents();
  state.loaderTextVisiblePromise = state.loaderImageReadyPromise;
  await state.loaderTextVisiblePromise;

  try {
    const response = await fetch(withDataVersion(DATA_URL));
    if (!response.ok) throw new Error(`Could not load ${DATA_URL}`);
    state.data = await response.json();
    logLoad("data loaded");
  } catch (error) {
    console.error(error);
    state.data = { anoBuilding: [], exhibition: [] };
  }

  renderAll({ immediate: true });
  const firstAnoReady = preloadMedia(getCurrentItem("anoBuilding"));
  const anoBackgroundsReady = preloadInitialBackgrounds();
  state.anoPreloadPromise = preloadAnoBuildingMedia();
  state.textPreloadPromise = preloadAllTexts();
  Promise.all([firstAnoReady])
    .catch(() => null)
    .then(() => state.resolveLoaderMinimum?.());

  const fontsReady = waitForFontsReady();
  const initialPreload = Promise.allSettled([
    firstAnoReady,
    state.anoPreloadPromise,
    anoBackgroundsReady,
    fontsReady,
    state.textPreloadPromise
  ]).then((result) => {
    logLoad("initial preload settled");
    return result;
  });

  initialPreload.then(() => {
    state.resolveLoaderReady?.();
    Promise.all([state.loaderRoadMinimumReady, state.loaderReadyPromise]).then(() => requestEnterSite("ready"));
  });
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
  els.loadingScreen = document.querySelector('[data-bind="loadingScreen"]');
  els.pageBackground = document.querySelector('[data-bind="pageBackground"]');
  els.backgroundLayers = Array.from(document.querySelectorAll("[data-background-layer]"));
  els.stages = {
    anoBuilding: document.querySelector('[data-gallery="anoBuilding"]'),
    exhibition: document.querySelector('[data-gallery="exhibition"]')
  };
}

function bindEvents() {
  document.querySelectorAll('[data-action="show-exhibition"]').forEach((trigger) => {
    trigger.addEventListener("click", () => {
      if (state.mediaSliding.anoBuilding) return;
      setPage("exhibition");
    });
  });

  document.querySelector('[data-action="back"]').addEventListener("click", () => {
    setPage("anoBuilding");
  });

  els.langButtons.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.lang));
  });

  const requestLoaderEntry = () => {
    state.loaderSkipped = true;
    Promise.all([state.loaderTextVisiblePromise, state.loaderRoadMinimumReady, state.loaderReadyPromise]).then(() => requestEnterSite("click"));
  };
  els.loadingScreen?.addEventListener("click", requestLoaderEntry);

  Object.entries(els.stages).forEach(([gallery, stage]) => {
    stage.addEventListener("click", (event) => {
      if (Date.now() < state.gesture.suppressClickUntil) {
        event.preventDefault();
        return;
      }
      const rect = stage.getBoundingClientRect();
      const direction = event.clientX - rect.left >= rect.width / 2 ? 1 : -1;
      changeImage(gallery, direction);
    });
    bindStageGesture(gallery, stage);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") changeImage(state.page, 1);
    if (event.key === "ArrowLeft") changeImage(state.page, -1);
  });
}

function bindStageGesture(gallery, stage) {
  stage.addEventListener("pointerdown", (event) => startStagePointerGesture(gallery, stage, event));
  stage.addEventListener("pointermove", moveStagePointerGesture);
  stage.addEventListener("pointerup", endStagePointerGesture);
  stage.addEventListener("pointercancel", cancelStagePointerGesture);
}

function startStagePointerGesture(gallery, stage, event) {
  if (!isMobileGestureViewport() || !event.isPrimary || state.mediaSliding[gallery] || !getAdjacentGestureItem(gallery, 1)) return;
  state.gesture.active = {
    gallery,
    stage,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    deltaX: 0,
    isSwipe: false,
    hasTriggered: false
  };
}

function moveStagePointerGesture(event) {
  const gesture = state.gesture.active;
  if (!gesture || !isMobileGestureViewport() || gesture.pointerId !== event.pointerId || state.mediaSliding[gesture.gallery] || gesture.hasTriggered) return;

  const deltaX = event.clientX - gesture.startX;
  const deltaY = event.clientY - gesture.startY;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  if (!gesture.isSwipe) {
    if (absX < GESTURE_DRAG_START_PX || absX <= absY) return;
    gesture.isSwipe = true;
    try {
      gesture.stage.setPointerCapture(gesture.pointerId);
    } catch {
      // Pointer capture can fail if the pointer already ended.
    }
  }

  event.preventDefault();
  gesture.deltaX = deltaX;
  if (absX >= GESTURE_POINTER_COMMIT_PX) {
    gesture.hasTriggered = true;
    state.gesture.suppressClickUntil = Date.now() + 500;
    triggerGestureImageChange(gesture.gallery, deltaX < 0 ? 1 : -1);
  }
}

function endStagePointerGesture(event) {
  const gesture = state.gesture.active;
  if (!gesture || gesture.pointerId !== event.pointerId) return;

  if (gesture.isSwipe) {
    event.preventDefault();
    state.gesture.suppressClickUntil = Date.now() + 500;
  }

  try {
    gesture.stage.releasePointerCapture(gesture.pointerId);
  } catch {
    // Matching the guarded capture call above.
  }
  state.gesture.active = null;
}

function cancelStagePointerGesture(event) {
  const gesture = state.gesture.active;
  if (!gesture || gesture.pointerId !== event.pointerId) return;
  state.gesture.active = null;
}

function triggerGestureImageChange(gallery, direction) {
  if (state.mediaSliding[gallery]) return;
  changeImage(gallery, direction, { skipStageAnimation: true });
}

function isMobileGestureViewport() {
  if (window.matchMedia) {
    return window.matchMedia("(max-width: 767px)").matches;
  }
  return window.innerWidth <= 767;
}

function getAdjacentGestureItem(gallery, direction) {
  const items = state.data[gallery] || [];
  if (!items.length) return null;
  return items[wrapIndex(state.indexes[gallery] + direction, items.length)] || null;
}

function setPage(page) {
  state.page = page;
  els.app.dataset.page = page;
  els.anoView.classList.toggle("is-active", page === "anoBuilding");
  els.exhibitionView.classList.toggle("is-active", page === "exhibition");
  if (page === "exhibition") {
    preloadExhibitionInBackground();
  }
  renderAll();
  updateCurrentPageBackground();
  updateSeoMeta();
}

function setLanguage(lang) {
  if (state.lang === lang) return;
  state.lang = lang;
  document.documentElement.lang = lang;
  document.documentElement.dataset.lang = lang;
  els.app.dataset.lang = lang;
  els.langButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === lang);
  });
  renderAll();
  updateSeoMeta();
}

function updateSeoMeta() {
  const meta = SEO_META[state.lang]?.[state.page] || SEO_META.ja.anoBuilding;
  document.title = meta.title;

  let description = document.querySelector('meta[name="description"]');
  if (!description) {
    description = document.createElement("meta");
    description.setAttribute("name", "description");
    document.head.appendChild(description);
  }
  description.setAttribute("content", meta.description);
}

function changeImage(gallery, direction, options = {}) {
  const items = state.data[gallery] || [];
  if (!items.length || state.mediaSliding[gallery]) return;

  const current = state.indexes[gallery];
  const next = wrapIndex(current + direction, items.length);
  if (current === next) return;

  const prevItem = items[current];
  const nextItem = items[next];
  state.indexes[gallery] = next;
  updateCurrentPageBackground(gallery);
  if (options.skipStageAnimation) {
    replaceCurrentStageMedia(gallery, nextItem, options.preparedMedia);
  } else {
    animateStage(gallery, nextItem, direction);
  }
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

function replaceCurrentStageMedia(gallery, item, preparedMedia) {
  const stage = els.stages[gallery];
  const current = stage.querySelector('[data-role="current-image"]');
  const media = preparedMedia || createMediaElement(item, gallery);

  pauseMedia(current);
  if (preparedMedia?.parentElement !== stage) {
    stage.appendChild(media);
  }
  current?.remove();

  media.dataset.role = "current-image";
  media.classList.remove("incoming", "is-entering", "is-leaving");
  media.classList.add("current", "is-current");
  media.style.transition = "";
  media.style.transform = "";
  applyMediaAccessibility(media, item, gallery);
  updateMediaAccessibility(gallery, item);
  cleanupStageMedia(stage);
  if (media.tagName === "VIDEO") {
    requestAnimationFrame(() => {
      const currentVideo = stage.querySelector('[data-role="current-image"].is-current');
      if (currentVideo === media) playVisibleVideo(currentVideo, item?.src);
    });
  }
  prepareMediaForSlide(media).then((isReady) => {
    if (isReady && media.tagName === "VIDEO") playVisibleVideo(media, media.src);
  });
}

async function animateStage(gallery, nextItem, direction) {
  if (gallery === "anoBuilding") {
    return animateAnoViewportStage(nextItem, direction);
  }

  const stage = els.stages[gallery];
  const className = direction > 0 ? "is-next" : "is-prev";
  const duration = getSlideDuration(gallery);
  const current = stage.querySelector('[data-role="current-image"]');
  const incomingSlot = stage.querySelector('[data-role="incoming-image"]');
  const incomingMedia = createMediaElement(nextItem, gallery);
  const enterFrom = direction > 0 ? "100vw" : "-100vw";
  const leaveTo = direction > 0 ? "-100vw" : "100vw";

  state.mediaSliding[gallery] = true;
  state.isAnimating = true;
  incomingMedia.dataset.role = "incoming-image";
  incomingMedia.classList.add("incoming", "is-current", "is-entering");
  incomingMedia.style.transition = "none";
  incomingMedia.style.transform = `translate3d(${enterFrom}, 0, 0)`;
  updateGalleryAriaLabel(gallery, nextItem);

  current?.classList.remove("is-current");
  current?.classList.add("is-leaving");
  if (current) {
    current.style.transition = "none";
    current.style.transform = "translate3d(0, 0, 0)";
  }

  pauseMedia(incomingSlot);
  pauseMedia(incomingMedia);
  if (incomingSlot) {
    incomingSlot.replaceWith(incomingMedia);
  } else {
    stage.appendChild(incomingMedia);
  }
  stage.classList.add("is-sliding");

  const isReady = await prepareMediaForSlide(incomingMedia);
  if (!isReady) {
    pauseMedia(incomingMedia);
    incomingMedia.remove();
    current?.classList.add("is-current");
    current?.classList.remove("is-leaving");
    current && (current.style.transition = "");
    current && (current.style.transform = "");
    stage.classList.remove("is-sliding");
    state.mediaSliding[gallery] = false;
    state.isAnimating = false;
    return;
  }
  await waitForPaint();

  stage.classList.add(className);
  const transition = `transform ${duration}ms var(--ease)`;
  if (current) {
    current.style.transition = transition;
    current.style.transform = `translate3d(${leaveTo}, 0, 0)`;
  }
  incomingMedia.style.transition = transition;
  incomingMedia.style.transform = "translate3d(0, 0, 0)";

  window.setTimeout(() => {
    pauseMedia(current);
    current?.remove();
    incomingMedia.dataset.role = "current-image";
    incomingMedia.classList.remove("incoming", "is-entering", "is-leaving");
    incomingMedia.classList.add("current", "is-current");
    incomingMedia.style.transition = "";
    incomingMedia.style.transform = "";
    stage.classList.remove(className, "is-sliding");
    cleanupStageMedia(stage);
    if (incomingMedia.tagName === "VIDEO") playVideo(incomingMedia, incomingMedia.src);
    state.mediaSliding[gallery] = false;
    state.isAnimating = false;
  }, duration + 40);
}

async function animateAnoViewportStage(nextItem, direction) {
  const gallery = "anoBuilding";
  const stage = els.stages[gallery];
  const page = els.anoView;
  const duration = getSlideDuration(gallery);
  const currentMedia = stage.querySelector('[data-role="current-image"]');

  state.mediaSliding[gallery] = true;
  state.isAnimating = true;
  page.classList.add("is-slide-locked");

  const enteringInfo = await getPreparedMediaInfo(nextItem);
  const enteringMedia = createMediaElement(nextItem, gallery);
  enteringMedia.dataset.role = "viewport-entering-image";
  enteringMedia.classList.add("is-current", "is-entering");
  updateGalleryAriaLabel(gallery, nextItem);

  const enteringReady = enteringInfo?.ok || await prepareMediaForSlide(enteringMedia);
  if (!enteringReady) {
    pauseMedia(enteringMedia);
    enteringMedia.remove();
    page.classList.remove("is-slide-locked");
    state.mediaSliding[gallery] = false;
    state.isAnimating = false;
    return;
  }

  const stageRect = stage.getBoundingClientRect();
  const leavingRect = getRenderedMediaRect(currentMedia, stageRect);
  const enteringRect = getRenderedMediaRect(enteringMedia, stageRect, enteringInfo);
  const distance = window.innerWidth || document.documentElement.clientWidth || stageRect.width;
  const enterFrom = direction > 0 ? distance : -distance;
  const leaveTo = direction > 0 ? -distance : distance;
  const layer = document.createElement("div");
  const leavingItem = createAnoViewportSlideItem(cloneMediaForSlide(currentMedia), leavingRect, "is-leaving");
  const enteringItem = createAnoViewportSlideItem(enteringMedia, enteringRect, "is-entering");

  layer.className = "ano-viewport-slide-layer";
  layer.setAttribute("aria-hidden", "true");
  leavingItem.style.transform = "translate3d(0, 0, 0)";
  enteringItem.style.transform = `translate3d(${enterFrom}px, 0, 0)`;
  layer.append(leavingItem, enteringItem);
  document.body.appendChild(layer);
  page.classList.add("is-viewport-sliding");

  await waitForPaint();

  const transition = `transform ${duration}ms var(--ease)`;
  leavingItem.style.transition = transition;
  enteringItem.style.transition = transition;
  leavingItem.style.transform = `translate3d(${leaveTo}px, 0, 0)`;
  enteringItem.style.transform = "translate3d(0, 0, 0)";

  window.setTimeout(async () => {
    setStageMedia(stage, "current-image", nextItem, gallery);
    updateMediaAccessibility(gallery, nextItem);
    cleanupStageMedia(stage);
    const newCurrent = stage.querySelector('[data-role="current-image"]');
    if (enteringInfo?.ok) {
      newCurrent?.classList.add("is-loaded");
    } else {
      await prepareMediaForSlide(newCurrent);
    }
    await waitForPaint();
    pauseMedia(leavingItem.querySelector(".stage-media"));
    pauseMedia(enteringItem.querySelector(".stage-media"));
    layer.remove();
    page.classList.remove("is-viewport-sliding", "is-slide-locked");
    state.mediaSliding[gallery] = false;
    state.isAnimating = false;
  }, duration + 40);
}

function createAnoViewportSlideItem(media, rect, className) {
  const item = document.createElement("div");
  item.className = `ano-viewport-slide-item ${className}`;
  applyRect(item, rect);
  media.classList.add("is-current", "is-loaded");
  media.style.transition = "";
  media.style.transform = "";
  item.appendChild(media);
  return item;
}

function cloneMediaForSlide(media) {
  if (!media) {
    const fallback = document.createElement("img");
    fallback.alt = "";
    fallback.className = "stage-image stage-media is-loaded";
    return fallback;
  }

  const clone = media.cloneNode(true);
  clone.dataset.role = "viewport-leaving-image";
  clone.classList.add("is-current", "is-loaded");
  clone.classList.remove("incoming", "is-entering", "is-leaving", "is-broken", "is-error");
  clone.style.transition = "";
  clone.style.transform = "";
  if (clone.tagName === "VIDEO") {
    clone.muted = true;
    clone.loop = true;
    clone.playsInline = true;
    clone.preload = "metadata";
    clone.setAttribute("playsinline", "");
  }
  return clone;
}

function applyRect(element, rect) {
  Object.assign(element.style, {
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`
  });
}

function getRenderedMediaRect(media, stageRect, prepared) {
  const size = getPreparedIntrinsicSize(prepared) || getMediaIntrinsicSize(media);
  if (!size) {
    return {
      left: stageRect.left,
      top: stageRect.top,
      width: stageRect.width,
      height: stageRect.height
    };
  }
  return getContainRect(stageRect, size.width, size.height);
}

function getPreparedIntrinsicSize(prepared) {
  if (!prepared?.ok) return null;
  const width = prepared.naturalWidth;
  const height = prepared.naturalHeight;
  return width > 0 && height > 0 ? { width, height } : null;
}

function getMediaIntrinsicSize(media) {
  if (!media) return null;
  if (media.tagName === "VIDEO") {
    const width = media.videoWidth;
    const height = media.videoHeight;
    return width > 0 && height > 0 ? { width, height } : null;
  }

  const width = media.naturalWidth;
  const height = media.naturalHeight;
  return width > 0 && height > 0 ? { width, height } : null;
}

function getContainRect(stageRect, naturalWidth, naturalHeight) {
  const stageRatio = stageRect.width / stageRect.height;
  const mediaRatio = naturalWidth / naturalHeight;
  let width;
  let height;

  if (mediaRatio > stageRatio) {
    width = stageRect.width;
    height = width / mediaRatio;
  } else {
    height = stageRect.height;
    width = height * mediaRatio;
  }

  return {
    left: stageRect.left + (stageRect.width - width) / 2,
    top: stageRect.top + (stageRect.height - height) / 2,
    width,
    height
  };
}

function renderAll(options = {}) {
  els.anoHeading.textContent = COPY.heading[state.lang];
  renderStage("anoBuilding");
  if (state.loaderEntered || state.page === "exhibition") {
    renderStage("exhibition");
  }
  renderAnoCaption();
  renderExhibitionDetails();
  if (state.loaderEntered) updateCurrentPageBackground();
}

function renderStage(gallery) {
  const item = getCurrentItem(gallery);
  setStageMedia(els.stages[gallery], "current-image", item, gallery);
  updateMediaAccessibility(gallery, item);
  cleanupStageMedia(els.stages[gallery]);
  if (state.loaderEntered || gallery === "anoBuilding") {
    scheduleWarmAdjacent(gallery, state.indexes[gallery]);
  }
}

function renderAnoCaption() {
  const item = getCurrentItem("anoBuilding");
  const rawTitle = item ? getTitle(item) : "";
  const subtitle = item ? getSubtitle(item) : "";
  const titleKey = getAnoCaptionTitleKey(rawTitle);
  const title = state.lang === "en" && titleKey === "archive" ? "Ano Bldg Archive" : rawTitle;
  els.anoTitle.textContent = title;
  renderAnoSubtitle(subtitle, titleKey);
  if (titleKey) {
    els.anoTitle.dataset.anoTitle = titleKey;
  } else {
    delete els.anoTitle.dataset.anoTitle;
  }
}

function renderAnoSubtitle(subtitle, titleKey) {
  if (titleKey === "archive" && subtitle.includes("available now")) {
    const label = document.createElement("span");
    const separator = document.createElement("span");
    const available = document.createElement("span");

    label.className = "ano-archive-label";
    label.textContent = "archive book";
    separator.className = "ano-archive-separator";
    separator.textContent = " / ";
    available.className = "ano-available-now";
    available.textContent = "available now";
    els.anoSubtitle.replaceChildren(label, separator, available);
    return;
  }

  els.anoSubtitle.textContent = subtitle;
}

function getAnoCaptionTitleKey(title) {
  if (title === "抽象化への探求") return "abstraction";
  if (title === "断片から全体へ") return "fragments";
  if (title === "読む建築展") return "reading";
  if (title === "アノビルアーカイブ") return "archive";
  if (title === "Ano Building Archive" || title === "Ano Bldg Archive") return "archive";
  return "";
}

function resetExhibitionTextScroll() {
  const scrollContainer = els.exhibitionText?.closest(".copy-scroll");
  requestAnimationFrame(() => {
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  });
}

async function renderExhibitionDetails(options = {}) {
  const item = getCurrentItem("exhibition");
  const total = state.data.exhibition.length;
  const current = state.indexes.exhibition + 1;
  els.app.dataset.exhibitionNumber = String(current);

  els.exhibitionTitle.textContent = item ? getTitle(item) : "";
  state.currentTitleKey = item ? getTitleKey(item) : "";
  els.currentCount.textContent = total ? pad2(current) : "00";
  els.totalCount.textContent = total ? ` | ${pad2(total)}` : " | 00";
  els.exhibitionInfo.innerHTML = COPY.exhibitionInfo[state.lang];

  if (!options.keepArchive) renderArchive(item);

  if (!item) {
    els.exhibitionText.textContent = "";
    resetExhibitionTextScroll();
    state.currentTextGroup = "";
    state.currentTextLang = "";
    state.currentTextPath = "";
    state.currentTextContent = "";
    return;
  }

  const nextTextGroup = getTextGroup(item);
  if (options.keepText && nextTextGroup === state.currentTextGroup && state.lang === state.currentTextLang) return;
  const nextTextPath = getTextPath(item, state.lang);
  const nextTextContent = await loadText(item);
  const textWillChange = nextTextGroup !== state.currentTextGroup ||
    state.lang !== state.currentTextLang ||
    nextTextPath !== state.currentTextPath ||
    nextTextContent !== state.currentTextContent;

  state.currentTextGroup = nextTextGroup;
  state.currentTextLang = state.lang;
  state.currentTextPath = nextTextPath;
  state.currentTextContent = nextTextContent;
  els.exhibitionText.textContent = nextTextContent;
  if (textWillChange) {
    resetExhibitionTextScroll();
  }
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

function getMediaTitle(item) {
  if (!item) return "";
  const preferredKey = state.lang === "ja" ? "titleJa" : "titleEn";
  const fallbackKey = state.lang === "ja" ? "titleEn" : "titleJa";
  return item[preferredKey] || item[fallbackKey] || "";
}

function getMediaAlt(item, gallery) {
  const title = getMediaTitle(item);
  if (!title) return "";

  if (gallery === "exhibition") {
    return state.lang === "ja"
      ? `建築展「アノビルのこと」の展示記録：${title}`
      : `Exhibition archive image from “Ano Bldg”: ${title}`;
  }

  return state.lang === "ja"
    ? `建築展「アノビルのこと」のアーカイブ画像：${title}`
    : `Archive image from the architecture exhibition “Ano Bldg”: ${title}`;
}

function getGalleryAriaLabel(item, gallery) {
  const title = getMediaTitle(item);
  if (!title) return "";

  if (gallery === "exhibition") {
    return state.lang === "ja"
      ? `展示記録の画像を切り替える：${title}`
      : `Change exhibition archive image: ${title}`;
  }

  return state.lang === "ja"
    ? `アノビルのことの画像を切り替える：${title}`
    : `Change Ano Bldg archive image: ${title}`;
}

function applyMediaAccessibility(media, item, gallery) {
  if (!media) return;
  const label = getMediaAlt(item, gallery);

  if (media.tagName === "IMG") {
    media.alt = label;
    media.removeAttribute("aria-label");
    media.removeAttribute("title");
    return;
  }

  if (media.tagName === "VIDEO") {
    if (label) {
      media.setAttribute("aria-label", label);
      media.setAttribute("title", label);
    } else {
      media.removeAttribute("aria-label");
      media.removeAttribute("title");
    }
  }
}

function updateGalleryAriaLabel(gallery, item) {
  const stage = els.stages[gallery];
  if (!stage) return;

  const stageLabel = getGalleryAriaLabel(item, gallery);
  if (stageLabel) {
    stage.setAttribute("aria-label", stageLabel);
  } else {
    stage.removeAttribute("aria-label");
  }
}

function updateMediaAccessibility(gallery, item) {
  const stage = els.stages[gallery];
  if (!stage) return;

  updateGalleryAriaLabel(gallery, item);

  stage.querySelectorAll('[data-role="current-image"], [data-role="incoming-image"]').forEach((media) => {
    applyMediaAccessibility(media, item, gallery);
  });
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
  const file = decodeURIComponent(stripQuery(src).split("/").pop() || "");
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

  const request = (async () => {
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

    return response.text();
  })();

  state.textCache.set(versionedPath, request);

  try {
    const text = await request;
    state.textCache.set(versionedPath, text);
    return text;
  } catch (error) {
    state.textCache.delete(versionedPath);
    if (!String(error?.message || "").startsWith("Text fetch failed:")) {
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

function stripQuery(src = "") {
  return String(src).split("?")[0];
}

function preloadInitialBackgrounds() {
  return Promise.allSettled(BACKGROUND_IMAGE_LIST.map((path) => preloadBackground(path)));
}

function getLoaderBackgroundPath() {
  return LOADER_IMAGE_PATH;
}

function getAnoBackgroundPath(item) {
  const number = getItemNumber(item, state.data.anoBuilding);
  if (number === 1) return BACKGROUND_IMAGES.first;
  if (number === 2) return BACKGROUND_IMAGES.second;
  if (number === 3) return BACKGROUND_IMAGES.third;
  return BACKGROUND_IMAGES.archive;
}

function getExhibitionBackgroundPath(item) {
  const number = getItemNumber(item, state.data.exhibition);
  if (number >= 1 && number <= 5) return BACKGROUND_IMAGES.archive;
  if (number >= 6 && number <= 9) return BACKGROUND_IMAGES.first;
  if (number === 10) return BACKGROUND_WHITE;
  if (number >= 11 && number <= 12) return BACKGROUND_IMAGES.first;
  if (number === 13) return BACKGROUND_WHITE;
  if (number === 14) return BACKGROUND_IMAGES.first;
  if (number >= 15 && number <= 16) return BACKGROUND_IMAGES.second;
  if (number === 18) return BACKGROUND_WHITE;
  if (number >= 17 && number <= 34) return BACKGROUND_IMAGES.third;
  return BACKGROUND_WHITE;
}

function getItemNumber(item, list = []) {
  const idNumber = Number.parseInt(item?.id, 10);
  if (Number.isFinite(idNumber)) return idNumber;
  const index = list.indexOf(item);
  return index >= 0 ? index + 1 : 0;
}

function updateCurrentPageBackground(sourceGallery = state.page, duration) {
  if (!state.loaderEntered && sourceGallery !== "loader") return;
  if (sourceGallery !== state.page && sourceGallery !== "loader") return;

  const item = getCurrentItem(state.page);
  const path = state.page === "exhibition"
    ? getExhibitionBackgroundPath(item)
    : getAnoBackgroundPath(item);
  const fadeDuration = duration ?? (state.page === "exhibition" ? BACKGROUND_FADE_EXHIBITION : BACKGROUND_FADE_ANO);
  setPageBackground(path, fadeDuration);
}

function setPageBackground(path, duration = BACKGROUND_FADE_LOADER) {
  if (!path || !els.backgroundLayers?.length || path === state.currentBackgroundPath) return;
  const requestId = state.backgroundRequestId + 1;
  state.backgroundRequestId = requestId;

  preloadBackground(path).then((result) => {
    if (requestId !== state.backgroundRequestId) return;
    if (!result.ok) {
      console.warn("[background preload failed]", path);
      return;
    }

    const nextIndex = state.activeBackgroundLayer === 0 ? 1 : 0;
    const nextLayer = els.backgroundLayers[nextIndex];
    const previousLayer = els.backgroundLayers[state.activeBackgroundLayer];
    if (!nextLayer) return;

    nextLayer.style.transitionDuration = `${duration}ms`;
    nextLayer.style.backgroundColor = path === BACKGROUND_WHITE ? "#fff" : "transparent";
    nextLayer.style.backgroundImage = path === BACKGROUND_WHITE ? "none" : `url("${path}")`;
    previousLayer && (previousLayer.style.transitionDuration = `${duration}ms`);
    nextLayer.classList.add("is-active");
    previousLayer?.classList.remove("is-active");
    state.activeBackgroundLayer = nextIndex;
    state.currentBackgroundPath = path;
  });
}

function preloadBackground(path) {
  if (path === BACKGROUND_WHITE) return Promise.resolve({ ok: true, src: path });
  if (!path) return Promise.resolve({ ok: false, src: "" });
  if (state.backgroundLoadCache.has(path)) return state.backgroundLoadCache.get(path);

  const task = new Promise((resolve) => {
    const image = new Image();
    const cleanup = () => {
      window.clearTimeout(timeout);
      image.onload = null;
      image.onerror = null;
    };
    const timeout = window.setTimeout(() => {
      cleanup();
      resolve({ ok: false, src: path, reason: "timeout" });
    }, BACKGROUND_LOAD_TIMEOUT);

    image.onload = () => {
      cleanup();
      resolve({ ok: true, src: path });
    };
    image.onerror = () => {
      cleanup();
      resolve({ ok: false, src: path, reason: "error" });
    };
    image.src = path;
  });

  state.backgroundLoadCache.set(path, task);
  return task;
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

function setStageMedia(stage, role, item, gallery) {
  const previous = stage.querySelector(`[data-role="${role}"]`);
  const media = createMediaElement(item, gallery);
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
  if (previous) {
    previous.replaceWith(media);
  } else {
    stage.appendChild(media);
  }
  if (role === "current-image") {
    playVisibleVideo(media, item?.src);
  }
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

function createMediaElement(item, gallery) {
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
    video.setAttribute("autoplay", "");
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    applyMediaAccessibility(video, item, gallery);
    video.className = "stage-image stage-media is-loaded";
    video.addEventListener("canplay", () => playVideo(video, item.src));
    requestAnimationFrame(() => playVideo(video, item.src));
    return video;
  }

  if (item.type && item.type !== "image" && item.type !== "svg") {
    console.warn(`Unsupported exhibition media type "${item.type}" for ${item.src}`);
  }

  const image = document.createElement("img");
  image.alt = getMediaAlt(item, gallery);
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

async function prepareMediaForSlide(media) {
  if (!media) return false;
  if (media.tagName === "VIDEO") {
    return prepareVideoForSlide(media);
  }
  return prepareImageForSlide(media);
}

async function prepareImageForSlide(image) {
  if (!image) return false;

  if (!(image.complete && image.naturalWidth > 0)) {
    await new Promise((resolve) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
    });
  }

  if (image.complete && image.naturalWidth > 0) {
    image.classList.add("is-loaded");
  } else {
    return false;
  }

  if (image.decode) {
    try {
      await image.decode();
    } catch (_) {
      // Continue even when a browser cannot decode before animation.
    }
  }

  return true;
}

async function prepareVideoForSlide(video) {
  if (!video) return false;
  if (video.readyState < 1) {
    await new Promise((resolve) => {
      video.addEventListener("loadedmetadata", resolve, { once: true });
      video.addEventListener("error", resolve, { once: true });
    });
  }
  if (video.readyState < 1) return false;
  video.classList.add("is-loaded");
  return true;
}

async function waitForPaint() {
  await nextFrame();
  await nextFrame();
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

function preloadLoaderImage(path) {
  return withTimeout(new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.fetchPriority = "high";
    image.onload = async () => {
      if (image.decode) {
        try {
          await image.decode();
        } catch (_) {
          // Continue if a browser cannot decode after load.
        }
      }
      resolve({ ok: true, src: path });
    };
    image.onerror = () => resolve({ ok: false, src: path, reason: "error" });
    image.src = path;
  }), BACKGROUND_LOAD_TIMEOUT, path).then((result) => {
    if (!result.ok) console.warn("[loader image preload failed]", result);
    return result;
  });
}

function waitForFontsReady() {
  if (!document.fonts?.ready) return Promise.resolve({ ok: true });
  return Promise.race([
    document.fonts.ready.then(() => ({ ok: true })),
    delay(BACKGROUND_LOAD_TIMEOUT).then(() => ({ ok: false, reason: "font-timeout" }))
  ]);
}

function prepareLoaderTextFast() {
  const loaderFonts = document.fonts?.load
    ? Promise.all([
      document.fonts.load('900 40px "toppan-bunkyu-midashi-go-std"'),
      document.fonts.load('400 10px "franklin-gothic-atf"')
    ])
    : Promise.resolve();
  const loaderBackground = preloadBackground(getLoaderBackgroundPath());

  return Promise.race([
    Promise.all([loaderFonts, loaderBackground]).then(() => {
      state.fontReady = true;
    }).catch(() => null),
    delay(LOADER_FONT_TIMEOUT)
  ]).then(showLoaderText);
}

function showLoaderText() {
  if (state.loaderTextVisible) return waitForPaint();
  state.loaderTextVisible = true;
  state.loaderVisibleStartTime = Date.now();
  els.loadingScreen?.classList.add("is-text-visible");
  delay(LOADER_ROAD_MIN_VISIBLE_MS).then(() => state.resolveLoaderRoadMinimum?.());
  logLoad("loader text visible", state.loaderVisibleStartTime - state.loaderStartTime);
  return waitForPaint();
}

function requestEnterSite(reason) {
  if (state.loaderExitStarted) return;
  state.loaderExitStarted = true;
  logLoad(`loader exit reason: ${reason}`);
  fadeOutLoader(LOADER_FADE_DURATION).then(() => enterSite(reason));
}

function fadeOutLoader(duration) {
  if (!els.loadingScreen) return Promise.resolve();
  els.loadingScreen.classList.add("is-hiding");
  return delay(duration).then(() => {
    els.loadingScreen.classList.add("is-hidden");
  });
}

function enterSite() {
  if (state.loaderEntered) return;
  state.loaderEntered = true;
  logLoad("loader total visible");
  updateCurrentPageBackground("loader", BACKGROUND_FADE_LOADER);
  renderStage("exhibition");
  scheduleWarmAdjacent("anoBuilding", state.indexes.anoBuilding);
  preloadExhibitionInBackground();
}

async function preloadAnoBuildingMedia() {
  const list = Array.isArray(state.data.anoBuilding) ? state.data.anoBuilding : [];
  const results = await Promise.all(list.map((item) => preloadMedia(item)));
  const failed = results.filter((result) => !result.ok);
  failed.forEach((result) => console.warn("[ano building media preload failed]", result));
  logLoad("ano media prepared");
  return results;
}

async function preloadAllTexts() {
  const paths = collectAllTextPaths();
  const results = await Promise.allSettled(
    paths.map((path) => fetchText(path, { id: "text-preload", textGroup: "preload" }, "preload"))
  );

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.warn("[text preload failed]", paths[index], result.reason);
    }
  });

  logLoad("texts preload settled");
  return results;
}

function collectAllTextPaths() {
  const paths = new Set();

  Object.values(state.data.texts || {}).forEach((group) => {
    if (group.ja) paths.add(group.ja);
    if (group.en) paths.add(group.en);
  });

  (state.data.exhibition || []).forEach((item) => {
    if (item.textJa) paths.add(item.textJa);
    if (item.textEn) paths.add(item.textEn);
  });

  return [...paths];
}

function preloadExhibitionInBackground() {
  if (state.backgroundPreloadStarted) return;
  const list = Array.isArray(state.data.exhibition) ? state.data.exhibition : [];
  if (!list.length) return;
  state.backgroundPreloadStarted = true;

  const priorityIds = new Map(["01", "02", "03", "04", "05", "06"].map((id, index) => [id, index]));
  const ordered = [...list].sort((a, b) => {
    const priorityA = priorityIds.has(a.id) ? priorityIds.get(a.id) : Number(a.id || 99);
    const priorityB = priorityIds.has(b.id) ? priorityIds.get(b.id) : Number(b.id || 99);
    return priorityA - priorityB;
  });
  let index = 0;

  const runNext = () => {
    const item = ordered[index];
    index += 1;
    if (!item) return;

    preloadMedia(item).finally(() => {
      scheduleIdle(runNext);
    });
  };

  scheduleIdle(runNext);
}

function preloadMedia(item) {
  if (!item || !item.src) return Promise.resolve({ ok: false, src: "" });
  if (state.mediaLoadCache.has(item.src)) return state.mediaLoadCache.get(item.src);

  const task = withTimeout(
    item.type === "video" ? preloadVideo(item.src) : preloadImage(item.src),
    MEDIA_LOAD_TIMEOUT,
    item.src
  ).then((result) => {
    if (!result.ok) console.warn("[media preload failed]", result);
    if (result.timeout) state.mediaLoadCache.delete(item.src);
    return result;
  });

  state.mediaLoadCache.set(item.src, task);
  return task;
}

function getPreparedMediaInfo(item) {
  if (!item?.src) return Promise.resolve(null);
  return preloadMedia(item);
}

function preloadImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = async () => {
      if (image.decode) {
        try {
          await image.decode();
        } catch (_) {
          // Continue when a browser cannot decode during preload.
        }
      }
      resolve({
        ok: true,
        src,
        naturalWidth: image.naturalWidth || 0,
        naturalHeight: image.naturalHeight || 0,
        element: image
      });
    };
    image.onerror = () => resolve({
      ok: false,
      src,
      naturalWidth: image.naturalWidth || 0,
      naturalHeight: image.naturalHeight || 0,
      element: image
    });
    image.src = src;
  });
}

function preloadVideo(src) {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.onloadedmetadata = () => resolve({
      ok: true,
      src,
      naturalWidth: video.videoWidth || 0,
      naturalHeight: video.videoHeight || 0,
      element: video
    });
    video.onerror = () => resolve({
      ok: false,
      src,
      naturalWidth: video.videoWidth || 0,
      naturalHeight: video.videoHeight || 0,
      element: video
    });
    video.src = src;
  });
}

function withTimeout(promise, timeout, src) {
  let timeoutId;
  const timeoutPromise = new Promise((resolve) => {
    timeoutId = window.setTimeout(() => {
      console.warn("[media preload timeout]", src);
      resolve({ ok: false, src, timeout: true });
    }, timeout);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => window.clearTimeout(timeoutId));
}

function scheduleIdle(callback) {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback);
  } else {
    window.setTimeout(callback, 300);
  }
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
  state.mediaWarmCache.set(item.src, preloadMedia(item));
}

function cleanupStageMedia(stage) {
  if (!stage) return;

  Array.from(stage.querySelectorAll(".stage-image")).forEach((media) => {
    if (media.dataset.role !== "current-image" && !media.classList.contains("is-current")) {
      pauseMedia(media);
      media.remove();
    }
  });

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

function playVisibleVideo(media, src) {
  if (media?.tagName !== "VIDEO") return;
  playVideo(media, src || media.currentSrc || media.src);
}

function playVideo(video, src) {
  video.muted = true;
  video.playsInline = true;
  video.autoplay = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.setAttribute("autoplay", "");
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

function getSlideDuration(gallery) {
  return gallery === "anoBuilding" ? 2000 : 1500;
}

function delayUntilMinimumLoaderTime() {
  const elapsed = Date.now() - state.loaderVisibleStartTime;
  return delay(Math.max(0, LOADER_MIN_DISPLAY - elapsed));
}

function delayUntilMaximumLoaderTime() {
  const elapsed = Date.now() - state.loaderVisibleStartTime;
  return delay(Math.max(0, LOADER_MAX_DISPLAY - elapsed));
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function logLoad(label, elapsed = Date.now() - state.loaderStartTime) {
  if (!DEBUG_LOAD) return;
  console.info(`[load] ${label}: ${elapsed} ms`);
}
