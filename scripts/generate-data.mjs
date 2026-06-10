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
const titleListPath = path.join(imageDir, "000_タイトル一覧.txt");

const anoBuildingImageBasePath = "assets/ano-building/images";
const imageBasePath = "assets/exhibition/images";
const textBasePath = "assets/exhibition/texts";

const anoBuildingPattern = /^(\d{2})_(.+?)(?:_(.+))?\.(webp|jpg|jpeg|png|webm|svg)$/i;
const mediaPattern = /^(\d{2})_(.+)\.(webp|jpg|jpeg|png|webm|svg)$/i;
const textPattern = /^(\d{2}(?:[,，.．]\d{2})*)_(.+)$/;
const titleListPattern = /^(\d{2})_JP:(.*?)_EN:(.*)$/;

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
  missingTitleIds: [],
  missingTextForMedia: [],
  missingEnText: [],
  missingJaText: [],
  duplicateTextIdCandidates: []
};

async function main() {
  const existingData = await readExistingData();
  const titleList = await readTitleList();
  const anoBuilding = await readAnoBuildingItems(existingData);
  const textGroups = await readTextGroups(titleList);
  const exhibition = await readMediaItems(textGroups, titleList);

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
            titleEn: group.titleEn,
            ja: group.ja || "",
            en: group.en || ""
          }
        ])
    )
  };

  await fs.mkdir(path.dirname(dataPath), { recursive: true });
  await fs.writeFile(dataPath, `${JSON.stringify(nextData, null, 2)}\n`, "utf8");

  printTitleListReport(titleList);
  printExhibitionFileCheck(exhibition);
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
  const filename = entry.name;
  const actualFileName = filename.normalize("NFC");
  const parseName = actualFileName.replace(/＿/g, "_");
  const match = parseName.match(anoBuildingPattern);
  if (!match) {
    console.warn(`Skipping unmatched ano building filename: ${actualFileName}`);
    return null;
  }

  const [, id, rawTitleJa, rawSubtitle, rawExtension] = match;
  const titleJa = rawTitleJa.normalize("NFC");
  const subtitle = (rawSubtitle || "").normalize("NFC");

  return {
    id,
    src: makeAssetSrc(anoBuildingImageBasePath, filename),
    type: getMediaType(rawExtension),
    titleJa,
    subtitleJa: subtitle,
    titleEn: getAnoBuildingTitleEn(titleJa),
    subtitleEn: subtitle
  };
}

async function readTitleList() {
  const titles = new Map();

  try {
    const raw = await fs.readFile(titleListPath, "utf8");
    raw.split(/\r?\n/).forEach((line, index) => {
      const normalizedLine = line.normalize("NFC").trim();
      if (!normalizedLine) return;
      const match = normalizedLine.match(titleListPattern);
      if (!match) {
        console.warn(`Skipping unmatched title line ${index + 1}: ${normalizedLine}`);
        return;
      }

      titles.set(match[1], {
        titleJa: match[2].trim(),
        titleEn: match[3].trim()
      });
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      console.warn("Title list not found: assets/exhibition/images/000_タイトル一覧.txt");
    } else {
      throw error;
    }
  }

  return titles;
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

async function readTextGroups(titleList) {
  const entries = await readTargetFiles(textDir, textExtensions);
  const groups = new Map();

  entries.forEach((entry) => {
    const filename = entry.name;
    const actualFileName = filename.normalize("NFC");
    const parseName = actualFileName.replace(/＿/g, "_");
    const isEnglish = /(?:_?EN)\.txt$/i.test(parseName);
    const baseName = parseName
      .replace(/(?:_?EN)\.txt$/i, "")
      .replace(/\.txt$/i, "")
      .normalize("NFC");
    const canonicalBaseName = getCanonicalTextBaseName(baseName, actualFileName);
    const match = canonicalBaseName.match(textPattern);

    if (!match) {
      console.warn(`Skipping unmatched text filename: ${actualFileName}`);
      return;
    }

    const numbers = normalizeIdList(match[1]);
    const textGroup = numbers.join(",");
    const titleFallback = getTextTitleJa(canonicalBaseName, match[2].normalize("NFC"));
    const title = getTitleForId(numbers[0], titleList, titleFallback);
    const isArchiveAscii = isArchiveAsciiTextBase(canonicalBaseName, numbers);
    const group = groups.get(textGroup) || {
      textGroup,
      numbers,
      titleJa: title.titleJa,
      titleEn: title.titleEn,
      ja: "",
      en: "",
      jaPriority: -1,
      enPriority: -1
    };
    const langKey = isEnglish ? "en" : "ja";
    const priority = isArchiveAscii ? 2 : 1;

    group.numbers = numbers;
    group.titleJa = title.titleJa;
    group.titleEn = title.titleEn;
    if (group[langKey] && group[`${langKey}Priority`] === priority) {
      report.duplicateTextIdCandidates.push(`${textGroup} ${langKey}: ${group[langKey]}, ${makeAssetSrc(textBasePath, filename)}`);
    }
    if (!group[langKey] || priority >= group[`${langKey}Priority`]) {
      group[langKey] = makeAssetSrc(textBasePath, filename);
      group[`${langKey}Priority`] = priority;
    }
    groups.set(textGroup, group);
  });

  [...groups.values()].forEach((group) => {
    if (!group.ja) report.missingJaText.push(group.textGroup);
    if (!group.en) report.missingEnText.push(group.textGroup);
  });

  return groups;
}

async function readMediaItems(textGroups, titleList) {
  const entries = await readTargetFiles(imageDir, mediaExtensions);

  return entries
    .map((entry) => parseMediaEntry(entry, textGroups, titleList))
    .filter(Boolean)
    .sort((a, b) => Number(a.id) - Number(b.id) || a.src.localeCompare(b.src));
}

function parseMediaEntry(entry, textGroups, titleList) {
  const filename = entry.name;
  const actualFileName = filename.normalize("NFC");
  const parseName = actualFileName.replace(/＿/g, "_");
  const match = parseName.match(mediaPattern);
  if (!match) {
    console.warn(`Skipping unmatched media filename: ${actualFileName}`);
    return null;
  }

  const [, id, rawTitleJa, rawExtension] = match;
  const fallbackTitleJa = rawTitleJa.normalize("NFC");
  const title = getTitleForId(id, titleList, fallbackTitleJa);
  const titleJa = title.titleJa;
  const titleEn = title.titleEn;
  const type = getMediaType(rawExtension);
  const group = findTextGroup({ id, titleJa, filename: actualFileName }, textGroups);
  const src = makeAssetSrc(imageBasePath, filename);
  const archive = isArchiveId(id);

  return {
    id,
    src,
    type,
    titleJa,
    titleEn,
    textGroup: group?.textGroup || "",
    textJa: group?.ja || "",
    textEn: group?.en || "",
    archive,
    archiveGroup: archive ? "ano-building-archive" : ""
  };
}

function findTextGroup(media, textGroups) {
  const candidates = [...textGroups.values()].filter((group) => group.numbers.includes(media.id));

  if (!candidates.length) {
    report.missingTextForMedia.push(`${media.id}_${media.titleJa}`);
    console.warn(`Missing textGroup for media: ${media.filename}`);
    return null;
  }

  if (candidates.length > 1) {
    const message = `${media.filename}: ${candidates.map((group) => group.textGroup).join(", ")}`;
    report.duplicateTextIdCandidates.push(message);
    console.warn(`Duplicate textGroup candidates: ${message}`);
  }

  return candidates[0];
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

function isArchiveAsciiTextBase(baseName, numbers) {
  return numbers.length === 1 && ARCHIVE_ASCII_GROUPS.get(numbers[0]) === baseName;
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

function getTitleForId(id, titleList, fallbackTitleJa) {
  const title = titleList.get(id);
  if (title) return title;
  if (!report.missingTitleIds.includes(id)) report.missingTitleIds.push(id);
  return {
    titleJa: fallbackTitleJa,
    titleEn: getTitleEn(fallbackTitleJa)
  };
}

function getAnoBuildingTitleEn(titleJa) {
  return anoBuildingTitleEnMap.get(titleJa) || getTitleEn(titleJa);
}

function isArchiveId(id) {
  return ["01", "02", "03", "04", "05"].includes(id);
}

function normalizeIdList(rawIds) {
  return rawIds.split(/[,，.．]/).map((number) => number.padStart(2, "0"));
}

function makeAssetSrc(base, actualFileName) {
  return `${base}/${encodeURI(actualFileName)}`;
}

function printReport(mediaCount, textGroupCount) {
  console.log(`exhibition media count: ${mediaCount}`);
  console.log(`text group count: ${textGroupCount}`);
  printList("missing text for media:", report.missingTextForMedia);
  printList("missing EN text:", report.missingEnText);
  printList("missing JA text:", report.missingJaText);
  printList("duplicate text id candidates:", report.duplicateTextIdCandidates);
}

function printAnoBuildingReport(items) {
  console.log(`anoBuilding media count: ${items.length}`);
  console.log("anoBuilding media file check:");
  ["01", "02", "03", "04"].forEach((id) => {
    console.log(`${id} ${items.some((item) => item.id === id) ? "exists" : "missing"}`);
  });
}

function printTitleListReport(titleList) {
  console.log("title list:");
  console.log(`loaded ${titleList.size} titles`);
  printList("missing title ids:", report.missingTitleIds);
}

function printExhibitionFileCheck(items) {
  console.log("exhibition media file check:");
  for (let index = 1; index <= 34; index += 1) {
    const id = String(index).padStart(2, "0");
    console.log(`${id} ${items.some((item) => item.id === id) ? "exists" : "missing"}`);
  }
}

function printArchiveAsciiTextCheck(texts) {
  console.log("archive ascii text check:");
  ARCHIVE_ASCII_GROUPS.forEach((_, id) => {
    const group = texts[id];
    const status = group?.ja && group?.en ? "ja/en exists" : [
      group?.ja ? "" : "missing ja",
      group?.en ? "" : "missing en"
    ].filter(Boolean).join(", ");
    console.log(`${id} ${status}`);
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
