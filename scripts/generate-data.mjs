import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const dataPath = path.join(rootDir, "data", "images.json");
const anoBuildingImageDir = path.join(rootDir, "assets", "ano-building", "images");
const imageDir = path.join(rootDir, "assets", "exhibition", "images");
const textDir = path.join(rootDir, "assets", "exhibition", "texts");

const anoBuildingImageBasePath = "assets/ano-building/images";
const imageBasePath = "assets/exhibition/images";
const textBasePath = "assets/exhibition/texts";

const anoBuildingPattern = /^(\d{2})_(.+?)(?:_(.+))?\.(webp|jpg|jpeg|png|webm|svg)$/i;
const mediaPattern = /^(\d{2})_(.+)\.(webp|jpg|jpeg|png|webm|svg)$/i;
const textPattern = /^(\d{2}(?:[,.]\d{2})*)_(.+)$/;

const TEXT_FILENAME_ALIASES = new Map([
  ["27,28_読む建築展の_EN.txt", "27,28_読む建築展_EN.txt"],
  ["06_抽象化への探求EN.txt", "06_抽象化への探求_EN.txt"]
]);

const ARCHIVE_ASCII_TITLE = "アノビルアーカイブ";
const ARCHIVE_ASCII_GROUPS = new Map(
  ["01", "02", "03", "04", "05"].map((id) => [id, `${id}_archive-book`])
);

const titleEnMap = new Map([
  ["アノビルアーカイブ", "Ano Building Archive"],
  ["抽象化への探求", "Exploration of Abstraction"],
  ["断片から全体へ", "From Fragments to the Whole"],
  ["読む建築展", "Reading Architecture Exhibition"]
]);

const anoBuildingTitleEnMap = new Map([
  ["アノビルアーカイブ", "Ano Building Archive"],
  ["抽象化への探求", "In Search of Abstraction"],
  ["断片から全体へ", "From Fragments to the Whole"],
  ["読む建築展", "Exhibition as a Medium for Architecture"]
]);

const mediaExtensions = new Set([".webp", ".jpg", ".jpeg", ".png", ".webm", ".svg"]);
const textExtensions = new Set([".txt"]);

const report = {
  missingTextGroupMedia: [],
  missingEnText: [],
  missingJaText: [],
  duplicateTextGroupCandidates: []
};

async function main() {
  const existingData = await readExistingData();
  const anoBuilding = await readAnoBuildingItems(existingData);
  const textGroups = await readTextGroups();
  const exhibition = await readMediaItems(textGroups);

  const nextData = {
    anoBuilding,
    exhibition,
    texts: Object.fromEntries(
      [...textGroups.values()]
        .sort((a, b) => Number(a.numbers[0]) - Number(b.numbers[0]) || a.textGroup.localeCompare(b.textGroup))
        .map((group) => [
          group.textGroup,
          {
            numbers: group.numbers,
            titleJa: group.titleJa,
            titleEn: getTitleEn(group.titleJa),
            ja: group.ja || "",
            en: group.en || ""
          }
        ])
    )
  };

  await fs.mkdir(path.dirname(dataPath), { recursive: true });
  await fs.writeFile(dataPath, `${JSON.stringify(nextData, null, 2)}\n`, "utf8");

  printAnoBuildingReport(anoBuilding);
  printReport(exhibition.length, textGroups.size);
  printArchiveAsciiTextCheck(nextData.texts);
}

async function readAnoBuildingItems(existingData) {
  const entries = await readTargetFiles(anoBuildingImageDir, mediaExtensions);
  const items = entries
    .map(parseAnoBuildingEntry)
    .filter(Boolean)
    .sort((a, b) => Number(a.id) - Number(b.id) || a.src.localeCompare(b.src));

  return items.length ? items : Array.isArray(existingData.anoBuilding) ? existingData.anoBuilding : [];
}

function parseAnoBuildingEntry(entry) {
  const filename = entry.name.normalize("NFC");
  const parseName = filename.replace(/＿/g, "_");
  const match = parseName.match(anoBuildingPattern);
  if (!match) {
    console.warn(`Skipping unmatched ano building filename: ${filename}`);
    return null;
  }

  const [, id, rawTitleJa, rawSubtitle, rawExtension] = match;
  const titleJa = rawTitleJa.normalize("NFC");
  const subtitle = (rawSubtitle || "").normalize("NFC");

  return {
    id,
    src: `${anoBuildingImageBasePath}/${filename}`,
    type: getMediaType(rawExtension),
    titleJa,
    subtitleJa: subtitle,
    titleEn: getAnoBuildingTitleEn(titleJa),
    subtitleEn: subtitle
  };
}

async function readExistingData() {
  try {
    return JSON.parse(await fs.readFile(dataPath, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn(`Could not read existing data/images.json: ${error.message}`);
    }
    return {};
  }
}

async function readTextGroups() {
  const entries = await readTargetFiles(textDir, textExtensions);
  const groups = new Map();

  entries.forEach((entry) => {
    const filename = entry.name.normalize("NFC");
    const isEnglish = /(?:_?EN)\.txt$/i.test(filename);
    const baseName = filename
      .replace(/(?:_?EN)\.txt$/i, "")
      .replace(/\.txt$/i, "")
      .normalize("NFC");
    const canonicalBaseName = getCanonicalTextBaseName(baseName, filename);
    const match = canonicalBaseName.match(textPattern);

    if (!match) {
      console.warn(`Skipping unmatched text filename: ${filename}`);
      return;
    }

    const numbers = match[1].split(/[,.]/).map((number) => number.padStart(2, "0"));
    const titleJa = getTextTitleJa(canonicalBaseName, match[2].normalize("NFC"));
    const textGroup = canonicalBaseName;
    const group = groups.get(textGroup) || {
      textGroup,
      numbers,
      titleJa,
      ja: "",
      en: ""
    };

    group.numbers = numbers;
    group.titleJa = titleJa;
    group[isEnglish ? "en" : "ja"] = `${textBasePath}/${filename}`;
    groups.set(textGroup, group);
  });

  [...groups.values()].forEach((group) => {
    if (!group.ja) report.missingJaText.push(group.textGroup);
    if (!group.en) report.missingEnText.push(group.textGroup);
  });

  return groups;
}

async function readMediaItems(textGroups) {
  const entries = await readTargetFiles(imageDir, mediaExtensions);

  return entries
    .map((entry) => parseMediaEntry(entry, textGroups))
    .filter(Boolean)
    .sort((a, b) => Number(a.id) - Number(b.id) || a.src.localeCompare(b.src));
}

function parseMediaEntry(entry, textGroups) {
  const filename = entry.name.normalize("NFC");
  const match = filename.match(mediaPattern);
  if (!match) {
    console.warn(`Skipping unmatched media filename: ${filename}`);
    return null;
  }

  const [, id, rawTitleJa, rawExtension] = match;
  const titleJa = rawTitleJa.normalize("NFC");
  const titleEn = getTitleEn(titleJa);
  const type = getMediaType(rawExtension);
  const group = findTextGroup({ id, titleJa, filename }, textGroups);
  const src = `${imageBasePath}/${filename}`;

  return {
    id,
    src,
    type,
    titleJa,
    titleEn,
    textGroup: group?.textGroup || "",
    textJa: group?.ja || "",
    textEn: group?.en || "",
    archive: isArchive({ filename, titleJa, titleEn }),
    archiveGroup: isArchive({ filename, titleJa, titleEn }) ? "ano-building-archive" : ""
  };
}

function findTextGroup(media, textGroups) {
  const archiveAsciiGroup = getArchiveAsciiGroup(media.id, media.titleJa);
  if (archiveAsciiGroup) {
    const group = textGroups.get(archiveAsciiGroup);
    if (group) return group;
  }

  const candidates = [...textGroups.values()].filter((group) => group.numbers.includes(media.id));

  if (!candidates.length) {
    report.missingTextGroupMedia.push(`${media.id}_${media.titleJa}`);
    console.warn(`Missing textGroup for media: ${media.filename}`);
    return null;
  }

  const titleMatches = candidates.filter((group) => group.titleJa === media.titleJa);
  const narrowed = titleMatches.length ? titleMatches : candidates;

  if (narrowed.length > 1) {
    const message = `${media.filename}: ${narrowed.map((group) => group.textGroup).join(", ")}`;
    report.duplicateTextGroupCandidates.push(message);
    console.warn(`Duplicate textGroup candidates: ${message}`);
  }

  return narrowed[0];
}

async function readTargetFiles(dir, extensions) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  return entries.filter((entry) => {
    const name = entry.name.normalize("NFC");
    if (!entry.isFile()) return false;
    if (name === "__MACOSX" || name === ".DS_Store" || name.startsWith(".")) return false;
    return extensions.has(path.extname(name).toLowerCase());
  });
}

function getCanonicalTextBaseName(baseName, filename) {
  const aliasTarget = TEXT_FILENAME_ALIASES.get(filename);
  if (!aliasTarget) return baseName;

  return aliasTarget
    .normalize("NFC")
    .replace(/(?:_?EN)\.txt$/i, "")
    .replace(/\.txt$/i, "");
}

function getTextTitleJa(textGroup, fallbackTitleJa) {
  if ([...ARCHIVE_ASCII_GROUPS.values()].includes(textGroup)) return ARCHIVE_ASCII_TITLE;
  return fallbackTitleJa;
}

function getArchiveAsciiGroup(id, titleJa) {
  if (titleJa !== ARCHIVE_ASCII_TITLE) return "";
  return ARCHIVE_ASCII_GROUPS.get(id) || "";
}

function getMediaType(extension) {
  const normalized = extension.toLowerCase();
  if (["webp", "jpg", "jpeg", "png"].includes(normalized)) return "image";
  if (normalized === "webm") return "video";
  if (normalized === "svg") return "svg";
  return "unknown";
}

function getTitleEn(titleJa) {
  return titleEnMap.get(titleJa) || titleJa;
}

function getAnoBuildingTitleEn(titleJa) {
  return anoBuildingTitleEnMap.get(titleJa) || getTitleEn(titleJa);
}

function isArchive({ filename, titleJa, titleEn }) {
  const haystack = `${filename} ${titleJa} ${titleEn}`.toLowerCase();
  return haystack.includes("アノビルアーカイブ") || haystack.includes("archive");
}

function printReport(mediaCount, textGroupCount) {
  console.log(`exhibition media count: ${mediaCount}`);
  console.log(`text group count: ${textGroupCount}`);
  printList("missing textGroup media:", report.missingTextGroupMedia);
  printList("missing EN text:", report.missingEnText);
  printList("missing JA text:", report.missingJaText);
  printList("duplicate textGroup candidates:", report.duplicateTextGroupCandidates);
}

function printAnoBuildingReport(items) {
  console.log(`anoBuilding media count: ${items.length}`);
  console.log("anoBuilding file check:");
  ["01", "02", "03", "04"].forEach((id) => {
    console.log(`${id} ${items.some((item) => item.id === id) ? "exists" : "missing"}`);
  });
}

function printArchiveAsciiTextCheck(texts) {
  console.log("archive ascii text check:");
  ARCHIVE_ASCII_GROUPS.forEach((groupKey) => {
    const group = texts[groupKey];
    const status = group?.ja && group?.en ? "ja/en exists" : [
      group?.ja ? "" : "missing ja",
      group?.en ? "" : "missing en"
    ].filter(Boolean).join(", ");
    console.log(`${groupKey} ${status}`);
  });
}

function printList(label, items) {
  console.log(label);
  if (!items.length) {
    console.log("- none");
    return;
  }
  items.forEach((item) => console.log(`- ${item}`));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
