import knowledge from "@/data/generated/knowledge.json";

export type FilterGroup =
  | "audience"
  | "conditions"
  | "stages"
  | "treatments"
  | "topics"
  | "symptoms"
  | "urgency";

export type Article = (typeof knowledge.articles)[number];

export const knowledgeData = knowledge;

export const filterGroupLabels: Record<FilterGroup, string> = {
  audience: "আমি কে?",
  conditions: "রোগ/সমস্যা",
  stages: "স্টেজ/অবস্থা",
  treatments: "চিকিৎসা ধাপ",
  topics: "কি জানতে চাই?",
  symptoms: "লক্ষণ",
  urgency: "অগ্রাধিকার"
};

export const filterGroupHints: Record<FilterGroup, string> = {
  audience: "রোগীর বর্তমান অবস্থার সাথে মিলিয়ে নিন",
  conditions: "একসাথে একাধিক রোগ বাছাই করা যাবে",
  stages: "স্টেজ জানা থাকলে ফলাফল আরও নির্দিষ্ট হবে",
  treatments: "ডায়ালাইসিস, ট্রান্সপ্লান্ট বা ওষুধের বিষয়",
  topics: "খাদ্য, টেস্ট, পানি, লবণ, পটাশিয়াম ইত্যাদি",
  symptoms: "যে লক্ষণ বা রিপোর্ট পরিবর্তন নিয়ে পড়তে চান",
  urgency: "জরুরি বা ফলোআপ দরকার এমন লেখা"
};

export const filterGroups: FilterGroup[] = [
  "audience",
  "conditions",
  "stages",
  "treatments",
  "topics",
  "symptoms",
  "urgency"
];

export function findArticleBySlug(slug: string) {
  return knowledgeData.articles.find((article) => article.slug === slug);
}
