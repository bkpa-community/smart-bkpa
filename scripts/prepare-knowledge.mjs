import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const knowledgeDir = path.join(root, "knowledge");
const generatedDir = path.join(root, "data", "generated");
const generatedFile = path.join(generatedDir, "knowledge.json");
const checkOnly = process.argv.includes("--check");

const categoryLabels = {
  aki: "একিউট কিডনি ইনজুরি",
  ckd: "ক্রনিক কিডনি রোগ",
  diabetes: "ডায়াবেটিস",
  dialysis: "ডায়ালাইসিস",
  "kidney-basic": "কিডনি বেসিক",
  "kidney-disease-and-pregnancy": "কিডনি রোগ ও গর্ভাবস্থা",
  others: "অন্যান্য",
  "paediatric-nephrology": "শিশু কিডনি",
  "renal-diet": "রেনাল ডায়েট",
  "renal-transplantation": "কিডনি প্রতিস্থাপন",
  urology: "ইউরোলজি"
};

const taxonomy = {
  audience: [
    rule("ckd-patient", "CKD রোগী", ["ckd", "chronic kidney", "ক্রনিক কিডনি", "সিকেডি"]),
    rule("dialysis-patient", "ডায়ালাইসিস রোগী", ["dialysis", "ডায়ালাইসিস", "হেমোডায়ালাইসিস", "peritoneal"]),
    rule("transplant-recipient", "ট্রান্সপ্লান্ট রোগী", ["transplant", "প্রতিস্থাপন", "recipient", "rejection", "tacrolimus", "immunosuppressive"]),
    rule("donor-family", "ডোনার/পরিবার", ["donor", "ডোনার", "hla", "crossmatch", "blood group"]),
    rule("child-patient", "শিশু রোগী", ["শিশু", "paediatric", "pediatric", "child"]),
    rule("pregnancy", "গর্ভাবস্থা", ["pregnancy", "গর্ভ", "প্রেগন্যান্সি", "pregnant"])
  ],
  conditions: [
    rule("high-blood-pressure", "উচ্চ রক্তচাপ", ["উচ্চ রক্তচাপ", "হাই ব্লাড", "ব্লাড প্রেসার", "blood pressure", "hypertension", "প্রেসার"]),
    rule("diabetes", "ডায়াবেটিস", ["diabetes", "ডায়াবেটিস", "সুগার", "glucose", "hba1c"]),
    rule("proteinuria", "প্রোটিনিউরিয়া", ["proteinuria", "proteinurea", "প্রোটিনিউরিয়া", "প্রোটিন", "এলবুমিন", "albumin", "acr", "pcr"]),
    rule("anemia", "রক্তস্বল্পতা", ["anemia", "anaemia", "রক্তস্বল্পতা", "হিমোগ্লোবিন", "hemoglobin", "hb"]),
    rule("infection", "ইনফেকশন", ["infection", "ইনফেকশন", "ভাইরাস", "virus", "bacterial", "ব্যাকটেরিয়া", "fungal", "জ্বর", "ঠান্ডা"]),
    rule("autoimmune", "অটোইমিউন", ["autoimmune", "অটোইমিউন", "lupus", "iga", "immun"]),
    rule("stone", "কিডনি স্টোন", ["stone", "স্টোন", "পাথর"]),
    rule("uric-acid", "ইউরিক অ্যাসিড", ["uric acid", "ইউরিক অ্যাসিড", "gout", "গাউট"]),
    rule("lipid", "লিপিড/চর্বি", ["lipid", "লিপিড", "cholesterol", "কোলেস্টেরল", "triglyceride", "চর্বি"])
  ],
  stages: [
    rule("ckd-stage-1-2", "CKD স্টেজ ১-২", ["stage 1", "stage 2", "স্টেজ ১", "স্টেজ ২", "gfr > 60", "60-89"]),
    rule("ckd-stage-3", "CKD স্টেজ ৩", ["stage 3", "স্টেজ ৩", "3a", "3b", "30-59", "45-59", "30-44"]),
    rule("ckd-stage-4", "CKD স্টেজ ৪", ["stage 4", "স্টেজ ৪", "15-29"]),
    rule("ckd-stage-5", "CKD স্টেজ ৫/ESRD", ["stage 5", "স্টেজ ৫", "esrd", "end stage", "gfr <15", "১৫ এর নিচে"]),
    rule("post-transplant", "ট্রান্সপ্লান্ট পরবর্তী", ["post transplant", "post-transplant", "প্রতিস্থাপন পরবর্তী", "ট্রান্সপ্লান্টের পর"]),
    rule("pre-transplant", "ট্রান্সপ্লান্ট পূর্ব", ["pre transplant", "preemptive", "fitness", "প্রতিস্থাপনের আগে"])
  ],
  treatments: [
    rule("dialysis", "ডায়ালাইসিস", ["dialysis", "ডায়ালাইসিস", "dry weight", "fistula", "ফিস্টুলা"]),
    rule("transplant", "কিডনি প্রতিস্থাপন", ["transplant", "প্রতিস্থাপন", "rejection", "hla", "crossmatch", "immunosuppressive"]),
    rule("medicine", "ওষুধ", ["medicine", "medication", "ওষুধ", "ঔষধ", "drug", "dose", "ডোজ", "tacrolimus", "mmf", "steroid"]),
    rule("vaccine", "ভ্যাকসিন", ["vaccine", "ভ্যাকসিন", "টিকা"]),
    rule("lifestyle", "লাইফস্টাইল", ["lifestyle", "লাইফস্টাইল", "exercise", "হাঁটা", "ব্যায়াম", "ধূমপান"])
  ],
  topics: [
    rule("diet", "খাদ্য ও ডায়েট", ["diet", "ডায়েট", "খাবার", "খাদ্য", "vegetable", "সবজি", "ফল", "লবণ", "প্রোটিন"]),
    rule("fluid", "পানি/ফ্লুইড", ["water", "পানি", "fluid", "ফ্লুইড", "dry weight"]),
    rule("potassium", "পটাশিয়াম", ["potassium", "পটাশ", "পটাসিয়াম", "ইলেক্ট্রোলাইট"]),
    rule("phosphorus", "ফসফরাস/ফসফেট", ["phosphorus", "phosphate", "ফসফরাস", "ফসফেট"]),
    rule("salt", "লবণ/সোডিয়াম", ["salt", "sodium", "nacl", "লবণ", "সোডিয়াম"]),
    rule("tests", "টেস্ট/রিপোর্ট", ["test", "টেস্ট", "পরীক্ষা", "creatinine", "egfr", "gfr", "urine", "রিপোর্ট", "level"]),
    rule("mental-health", "মানসিক স্বাস্থ্য", ["হতাশা", "বিষন্নতা", "depression", "stigma", "mental"]),
    rule("legal", "আইন/নিয়ম", ["law", "legal", "আইন", "লিগ্যাল"])
  ],
  symptoms: [
    rule("swelling", "ফোলা", ["ফোলা", "swelling", "edema", "oedema"]),
    rule("fever-cold", "জ্বর/ঠান্ডা", ["জ্বর", "ঠান্ডা", "cold", "cough", "fever"]),
    rule("urine-change", "প্রস্রাবের পরিবর্তন", ["urine", "প্রস্রাব", "মূত্র", "pus cell", "rbc"]),
    rule("pain", "ব্যথা", ["ব্যথা", "pain", "cramp"])
  ],
  urgency: [
    rule("emergency", "জরুরি", ["emergency", "ইমারজেন্সি", "হাসপাতাল", "hospitalized", "৬.৫", "6.5", "শ্বাসকষ্ট", "বিপজ্জনক"]),
    rule("doctor-followup", "ডাক্তারের ফলোআপ দরকার", ["নেফ্রোলজিস্ট", "ডাক্তার", "doctor", "follow-up", "পরামর্শ"])
  ]
};

function rule(id, label, keywords) {
  return { id, label, keywords };
}

function walkMarkdown(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkMarkdown(fullPath);
    if (!entry.isFile() || !entry.name.endsWith(".md") || entry.name === "_index.md") return [];
    return [fullPath];
  });
}

function slugifyBangla(input) {
  return input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function compactUnique(values) {
  return [...new Set(values.filter(Boolean))];
}

function hasKeyword(haystack, keyword) {
  return haystack.includes(keyword.toLowerCase());
}

function inferGroup(text, group) {
  return taxonomy[group]
    .filter((item) => item.keywords.some((keyword) => hasKeyword(text, keyword)))
    .map((item) => item.id);
}

function labelsFor(group, ids) {
  const byId = new Map(taxonomy[group].map((item) => [item.id, item.label]));
  return ids.map((id) => byId.get(id) ?? id);
}

function firstBanglaSummary(content) {
  const cleaned = content
    .replace(/^#+\s+/gm, "")
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[[^\]]+]\([^)]+\)/g, "")
    .replace(/[*_`>#\\]/g, "")
    .replace(/[Ⓒ©].*/g, "")
    .split(/\n+/)
    .map((line) => line.trim())
    .find((line) => line.length > 70 && !/caution|সতর্কতা|bkpa/i.test(line));

  return (cleaned ?? "").slice(0, 210);
}

function readingTime(content) {
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}

function relevanceProfile(frontmatter, content) {
  const title = frontmatter.title ?? "";
  const haystack = `${title}\n${content}`.toLowerCase();
  const category = frontmatter.category;
  const conditions = compactUnique([...(frontmatter.conditions ?? []), ...inferGroup(haystack, "conditions")]);
  const topics = compactUnique([...(frontmatter.topics ?? []), ...inferGroup(haystack, "topics")]);
  const audience = compactUnique([...(frontmatter.audience ?? []), ...inferGroup(haystack, "audience")]);
  const stages = compactUnique([...(frontmatter.stages ?? []), ...inferGroup(haystack, "stages")]);
  const treatments = compactUnique([...(frontmatter.treatments ?? []), ...inferGroup(haystack, "treatments")]);
  const symptoms = compactUnique([...(frontmatter.symptoms ?? []), ...inferGroup(haystack, "symptoms")]);
  const urgency = compactUnique([...(frontmatter.urgency ?? []), ...inferGroup(haystack, "urgency")]);

  if (category === "ckd" && !audience.includes("ckd-patient")) audience.push("ckd-patient");
  if (category === "dialysis" && !audience.includes("dialysis-patient")) audience.push("dialysis-patient");
  if (category === "renal-transplantation" && !audience.includes("transplant-recipient")) audience.push("transplant-recipient");
  if (category === "renal-diet" && !topics.includes("diet")) topics.push("diet");
  if (category === "diabetes" && !conditions.includes("diabetes")) conditions.push("diabetes");

  return { audience, conditions, stages, treatments, topics, symptoms, urgency };
}

function sortKeys(data) {
  const preferred = [
    "title",
    "slug",
    "date",
    "description",
    "summary",
    "image",
    "category",
    "categoryLabelBn",
    "audience",
    "conditions",
    "stages",
    "treatments",
    "topics",
    "symptoms",
    "urgency",
    "searchKeywords",
    "readingTimeMinutes",
    "draft"
  ];
  const next = {};
  for (const key of preferred) {
    if (data[key] !== undefined && data[key] !== "") next[key] = data[key];
  }
  for (const key of Object.keys(data).sort()) {
    if (!(key in next) && data[key] !== undefined && data[key] !== "") next[key] = data[key];
  }
  return next;
}

const files = walkMarkdown(knowledgeDir);
const articles = [];
let changedFiles = 0;

for (const file of files) {
  const raw = fs.readFileSync(file, "utf8");
  const parsed = matter(raw);
  const relativePath = path.relative(root, file);
  const category = path.relative(knowledgeDir, path.dirname(file)).split(path.sep)[0];
  const baseSlug = slugifyBangla(path.basename(file, ".md"));
  const slug = `${category}/${baseSlug}`;
  const title = parsed.data.title ?? path.basename(file, ".md");
  const summary = parsed.data.summary || parsed.data.description || firstBanglaSummary(parsed.content);
  const profile = relevanceProfile({ ...parsed.data, category }, parsed.content);
  const searchKeywords = compactUnique([
    categoryLabels[category],
    ...Object.entries(profile).flatMap(([group, ids]) => labelsFor(group, ids))
  ]);

  const nextData = sortKeys({
    ...parsed.data,
    title,
    slug,
    description: parsed.data.description ?? "",
    summary,
    category,
    categoryLabelBn: categoryLabels[category] ?? category,
    audience: profile.audience,
    conditions: profile.conditions,
    stages: profile.stages,
    treatments: profile.treatments,
    topics: profile.topics,
    symptoms: profile.symptoms,
    urgency: profile.urgency,
    searchKeywords,
    readingTimeMinutes: readingTime(parsed.content)
  });

  const nextRaw = matter.stringify(parsed.content.trimStart(), nextData, {
    lineWidth: 120,
    quotingType: "'"
  });

  if (nextRaw.trim() !== raw.trim()) {
    changedFiles += 1;
    if (!checkOnly) fs.writeFileSync(file, `${nextRaw.trim()}\n`, "utf8");
  }

  articles.push({
    title,
    slug,
    path: relativePath,
    category,
    categoryLabelBn: categoryLabels[category] ?? category,
    date: parsed.data.date ?? null,
    image: parsed.data.image ?? null,
    summary,
    readingTimeMinutes: readingTime(parsed.content),
    ...profile,
    searchKeywords,
    content: parsed.content.trim()
  });
}

const filters = Object.fromEntries(
  Object.entries(taxonomy).map(([group, items]) => [
    group,
    items.map(({ id, label }) => ({ id, label }))
  ])
);

const payload = {
  generatedAt: new Date().toISOString(),
  totalArticles: articles.length,
  categories: Object.entries(categoryLabels).map(([id, label]) => ({ id, label })),
  filters,
  articles: articles.sort((a, b) => {
    const dateA = a.date ? Date.parse(a.date) : 0;
    const dateB = b.date ? Date.parse(b.date) : 0;
    return dateB - dateA || a.title.localeCompare(b.title, "bn");
  })
};

if (!checkOnly) {
  fs.mkdirSync(generatedDir, { recursive: true });
  fs.writeFileSync(generatedFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

if (checkOnly && changedFiles > 0) {
  console.error(`${changedFiles} knowledge files need regenerated frontmatter.`);
  process.exit(1);
}

console.log(
  `${checkOnly ? "Checked" : "Prepared"} ${articles.length} articles, ${changedFiles} frontmatter updates${
    checkOnly ? "" : `, wrote ${path.relative(root, generatedFile)}`
  }.`
);
