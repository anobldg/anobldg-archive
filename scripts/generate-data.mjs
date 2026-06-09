import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const dataPath = path.join(rootDir, "data", "images.json");
const imageDir = path.join(rootDir, "assets", "exhibition", "images");
const textDir = path.join(rootDir, "assets", "exhibition", "texts");

const imageBasePath = "assets/exhibition/images";
const textBasePath = "assets/exhibition/texts";

const mediaPattern = /^(\d{2})_(.+)\.(webp|jpg|jpeg|png|webm|svg)$/i;
const textPattern = /^(\d{2}(?:[,.]\d{2})*)_(.+?)(?:_EN)?\.txt$/i;

const titleEnMap = new Map([
  ["アノビルアーカイブ", "Ano Building Archive"],
  ["抽象化への探求", "Exploration of Abstraction"],
  ["断片から全体へ", "From Fragments to the Whole"],
  ["読む建築展", "Reading Architecture Exhibition"]
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
  const textGroups = await readTextGroups();
  const exhibition = await readMediaItems(textGroups);

  const nextData = {
    anoBuilding: Array.isArray(existingData.anoBuilding) ? existingData.anoBuilding : [],
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

  printReport(exhibition.length, textGroups.size);
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
    const match = filename.match(textPattern);
    if (!match) {
      console.warn(`Skipping unmatched text filename: ${filename}`);
      return;
    }

    const isEn = /_EN\.txt$/i.test(filename);
    const numbers = match[1].split(/[,.]/).map((number) => number.padStart(2, "0"));
    const titleJa = match[2].normalize("NFC");
    const textGroup = filename.replace(/(?:_EN)?\.txt$/i, "").normalize("NFC");
    const group = groups.get(textGroup) || {
      textGroup,
      numbers,
      titleJa,
      ja: "",
      en: ""
    };

    group.numbers = numbers;
    group.titleJa = titleJa;
    group[isEn ? "en" : "ja"] = `${textBasePath}/${filename}`;
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
    archive: isArchive({ filename, titleJa, titleEn })
  };
}

function findTextGroup(media, textGroups) {
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
