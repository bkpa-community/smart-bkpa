"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Activity, ChevronDown, Filter, Search, SlidersHorizontal, X } from "lucide-react";
import {
  filterGroupHints,
  filterGroupLabels,
  filterGroups,
  knowledgeData,
  type Article,
  type FilterGroup
} from "@/lib/knowledge";

type SelectedFilters = Record<FilterGroup | "categories", string[]>;

const initialFilters: SelectedFilters = {
  categories: [],
  audience: [],
  conditions: [],
  stages: [],
  treatments: [],
  topics: [],
  symptoms: [],
  urgency: []
};

const quickProfiles = [
  {
    label: "উচ্চ রক্তচাপ + CKD",
    filters: { audience: ["ckd-patient"], conditions: ["high-blood-pressure"], topics: ["tests"] }
  },
  {
    label: "ডায়াবেটিস + কিডনি",
    filters: { audience: ["ckd-patient"], conditions: ["diabetes"], topics: ["diet", "tests"] }
  },
  {
    label: "ডায়ালাইসিস + পানি",
    filters: { audience: ["dialysis-patient"], treatments: ["dialysis"], topics: ["fluid"] }
  },
  {
    label: "ট্রান্সপ্লান্ট ফলোআপ",
    filters: { audience: ["transplant-recipient"], stages: ["post-transplant"], topics: ["tests"] }
  },
  {
    label: "ডায়েট + পটাশিয়াম",
    filters: { topics: ["diet", "potassium"] }
  }
];

export default function KnowledgeFinder() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const selected = useMemo(() => selectedFromParams(searchParams), [searchParams]);
  const articleQuery = searchParams.toString();

  const [filtersOpen, setFiltersOpen] = useState(false);

  const counts = useMemo(() => buildCounts(knowledgeData.articles), []);
  const activeCount = Object.values(selected).reduce((sum, values) => sum + values.length, 0);
  const hasActiveContext = activeCount > 0 || Boolean(query.trim());

  const results = useMemo(() => {
    return knowledgeData.articles
      .map((article) => ({ article, score: scoreArticle(article, selected, query) }))
      .filter(({ score }) => score > -1)
      .sort((a, b) => b.score - a.score)
      .map(({ article }) => article);
  }, [query, selected]);

  const smartSuggestions = useMemo(
    () => (hasActiveContext ? suggestFilters(results, selected) : []),
    [hasActiveContext, results, selected]
  );

  function toggle(group: keyof SelectedFilters, id: string) {
    const hasValue = selected[group].includes(id);
    const nextSelected = {
      ...selected,
      [group]: hasValue ? selected[group].filter((item) => item !== id) : [...selected[group], id]
    };

    updateUrl(nextSelected, query);
  }

  function applyQuick(filters: Partial<SelectedFilters>) {
    updateUrl({
      ...initialFilters,
      ...Object.fromEntries(Object.entries(filters).map(([key, value]) => [key, value ?? []]))
    } as SelectedFilters, "");
  }

  function clearAll() {
    updateUrl(initialFilters, "");
  }

  function updateQuery(nextQuery: string) {
    updateUrl(selected, nextQuery);
  }

  function updateUrl(nextSelected: SelectedFilters, nextQuery: string) {
    const params = paramsFromSelected(nextSelected, nextQuery);
    const nextUrl = params.toString() ? `${pathname}?${params.toString()}#finder` : `${pathname}#finder`;
    router.replace(nextUrl, { scroll: false });
  }

  return (
    <div className="finder">
      <button
        className="filters-toggle"
        type="button"
        aria-expanded={filtersOpen}
        onClick={() => setFiltersOpen((prev) => !prev)}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <SlidersHorizontal size={18} aria-hidden="true" />
          ফিল্টার
          {activeCount > 0 && (
            <span className="selected-count">{activeCount}</span>
          )}
        </span>
        <ChevronDown
          className="filters-toggle-icon"
          size={18}
          aria-hidden="true"
          style={{ transform: filtersOpen ? "rotate(180deg)" : undefined }}
        />
      </button>

      <aside className={`filters${filtersOpen ? " filters--open" : ""}`} aria-label="ফিল্টার">
        <div className="filters-header">
          <h2>
            <SlidersHorizontal size={18} aria-hidden="true" /> ফিল্টার
          </h2>
          <p>{activeCount ? `${activeCount}টি ফিল্টার চালু আছে` : "রোগীর প্রোফাইল বানিয়ে শুরু করুন"}</p>
          {activeCount > 0 || query ? (
            <button className="clear-btn" type="button" onClick={clearAll}>
              সব মুছুন
            </button>
          ) : null}
        </div>

        <div className="filter-group">
          <div className="filter-title">
            <Activity size={17} aria-hidden="true" /> দ্রুত প্রোফাইল
          </div>
          <div className="chip-grid">
            {quickProfiles.map((profile) => (
              <button className="quick-btn" key={profile.label} type="button" onClick={() => applyQuick(profile.filters)}>
                {profile.label}
              </button>
            ))}
          </div>
        </div>

        <FilterSection
          title="বিভাগ"
          hint="মূল কনটেন্ট বিভাগ"
          items={knowledgeData.categories}
          selected={selected.categories}
          counts={counts.categories}
          defaultOpen
          onToggle={(id) => toggle("categories", id)}
        />

        {filterGroups.map((group) => (
          <FilterSection
            key={group}
            title={filterGroupLabels[group]}
            hint={filterGroupHints[group]}
            items={knowledgeData.filters[group]}
            selected={selected[group]}
            counts={counts[group]}
            onToggle={(id) => toggle(group, id)}
          />
        ))}
      </aside>

      <section>
        <label className="searchbox">
          <Search size={22} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            placeholder="বাংলা বা English লিখে খুঁজুন: পটাশিয়াম, প্রোটিন, creatinine..."
          />
        </label>

        {smartSuggestions.length ? (
          <div className="smart-strip" aria-label="স্মার্ট সাজেশন">
            <div>
              <strong>আরও নির্দিষ্ট করুন</strong>
              <p>বর্তমান ফলাফলের ভেতর সবচেয়ে কাজে লাগতে পারে এমন ফিল্টার।</p>
            </div>
            <div className="smart-actions">
              {smartSuggestions.map((suggestion) => (
                <button
                  className="smart-chip"
                  key={`${suggestion.group}-${suggestion.id}`}
                  type="button"
                  onClick={() => toggle(suggestion.group, suggestion.id)}
                >
                  {suggestion.label}
                  <span>{suggestion.count}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="results">
          <div className="results-header">
            <h2>{results.length}টি লেখা পাওয়া গেছে</h2>
            <p>যে লেখায় বেশি ফিল্টার মিলে, সেটি আগে দেখানো হচ্ছে।</p>
          </div>

          {results.length ? (
            <div className="article-list">
              {results.map((article) => (
                <ArticleCard article={article} key={article.slug} query={articleQuery} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <X size={26} aria-hidden="true" />
              <h3>এই কম্বিনেশনে লেখা পাওয়া যায়নি</h3>
              <p>একটি ফিল্টার কমিয়ে দেখুন, অথবা সার্চ শব্দটি একটু সাধারণ করে লিখুন।</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function FilterSection({
  title,
  hint,
  items,
  selected,
  counts,
  defaultOpen,
  onToggle
}: {
  title: string;
  hint: string;
  items: { id: string; label: string }[];
  selected: string[];
  counts: Record<string, number>;
  defaultOpen?: boolean;
  onToggle: (id: string) => void;
}) {
  const visibleItems = items.filter((item) => counts[item.id] > 0);
  const isOpen = defaultOpen || selected.length > 0;

  return (
    <details className="filter-group collapsible-filter" open={isOpen}>
      <summary className="filter-summary">
        <span className="filter-title">
          <Filter size={16} aria-hidden="true" /> {title}
        </span>
        <span className="filter-summary-meta">
          {selected.length ? <span className="selected-count">{selected.length}</span> : null}
          <ChevronDown className="collapse-icon" size={18} aria-hidden="true" />
        </span>
      </summary>
      <div className="filter-panel">
        <p className="hint">{hint}</p>
        <div className="chip-grid">
          {visibleItems.map((item) => (
            <button
              className="chip"
              data-active={selected.includes(item.id)}
              key={item.id}
              type="button"
              onClick={() => onToggle(item.id)}
            >
              <span>{item.label}</span>
              <span className="chip-count">{counts[item.id]}</span>
            </button>
          ))}
        </div>
      </div>
    </details>
  );
}

function ArticleCard({ article, query }: { article: Article; query: string }) {
  const tags = uniqueTags([
    article.categoryLabelBn,
    ...labelsFor(article.conditions, "conditions"),
    ...labelsFor(article.topics, "topics"),
    ...labelsFor(article.audience, "audience"),
    ...labelsFor(article.stages, "stages")
  ]).slice(0, 7);

  return (
    <Link className="article-card" href={`/knowledge/${article.slug}${query ? `?${query}` : ""}`}>
      <div className="article-meta">
        <span>{article.readingTimeMinutes} মিনিট পড়া</span>
        <span>•</span>
        <span>{article.categoryLabelBn}</span>
      </div>
      <h3>{article.title}</h3>
      {article.summary ? <p>{article.summary}</p> : null}
      <div className="tagline">
        {article.urgency.includes("emergency") ? <span className="tag priority">জরুরি</span> : null}
        {tags.map((tag, index) => (
          <span className="tag" key={`${tag}-${index}`}>
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}

function scoreArticle(article: Article, selected: SelectedFilters, query: string) {
  let score = 0;

  if (selected.categories.length) {
    if (!selected.categories.includes(article.category)) return -1;
    score += 6;
  }

  for (const group of filterGroups) {
    const chosen = selected[group];
    if (!chosen.length) continue;
    const values = article[group] as string[];
    const matches = chosen.filter((id) => values.includes(id));
    if (!matches.length) return -1;
    score += matches.length * 10;
  }

  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery) {
    const searchable = [
      article.title,
      article.summary,
      article.categoryLabelBn,
      article.searchKeywords.join(" "),
      article.content
    ]
      .join(" ")
      .toLowerCase();

    const queryTerms = expandQuery(normalizedQuery);
    const matchedTerms = queryTerms.filter((term) => searchable.includes(term));

    if (!matchedTerms.length) return -1;
    score += article.title.toLowerCase().includes(normalizedQuery) ? 14 : 4 + matchedTerms.length * 2;
  }

  return score;
}

function selectedFromParams(searchParams: URLSearchParams): SelectedFilters {
  return {
    categories: parseParamList(searchParams.get("categories")),
    audience: parseParamList(searchParams.get("audience")),
    conditions: parseParamList(searchParams.get("conditions")),
    stages: parseParamList(searchParams.get("stages")),
    treatments: parseParamList(searchParams.get("treatments")),
    topics: parseParamList(searchParams.get("topics")),
    symptoms: parseParamList(searchParams.get("symptoms")),
    urgency: parseParamList(searchParams.get("urgency"))
  };
}

function paramsFromSelected(selected: SelectedFilters, query: string) {
  const params = new URLSearchParams();
  const trimmedQuery = query.trim();

  if (trimmedQuery) params.set("q", trimmedQuery);

  for (const group of ["categories", ...filterGroups] as Array<keyof SelectedFilters>) {
    if (selected[group].length) params.set(group, selected[group].join(","));
  }

  return params;
}

function parseParamList(value: string | null) {
  return value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];
}

function expandQuery(query: string) {
  const aliases: Record<string, string[]> = {
    bp: ["bp", "blood pressure", "ব্লাড প্রেসার", "রক্তচাপ", "প্রেসার"],
    pressure: ["pressure", "blood pressure", "ব্লাড প্রেসার", "রক্তচাপ", "প্রেসার"],
    "ব্লাড প্রেসার": ["ব্লাড প্রেসার", "blood pressure", "hypertension", "উচ্চ রক্তচাপ"],
    "রক্তচাপ": ["রক্তচাপ", "blood pressure", "hypertension", "প্রেসার"],
    sugar: ["sugar", "diabetes", "ডায়াবেটিস", "সুগার", "glucose"],
    diabetes: ["diabetes", "ডায়াবেটিস", "সুগার", "glucose"],
    creatinine: ["creatinine", "ক্রিয়েটিনিন", "ক্রিয়েটিনিন", "egfr", "gfr"],
    potassium: ["potassium", "পটাশিয়াম", "পটাশিয়াম", "পটাসিয়াম"],
    protein: ["protein", "প্রোটিন", "albumin", "এলবুমিন", "proteinuria"],
    transplant: ["transplant", "ট্রান্সপ্লান্ট", "প্রতিস্থাপন"],
    dialysis: ["dialysis", "ডায়ালাইসিস", "ডায়ালাইসিস"]
  };

  return uniqueTags([query, ...(aliases[query] ?? [])]);
}

function suggestFilters(articles: Article[], selected: SelectedFilters) {
  const suggestions: Array<{ count: number; group: FilterGroup; id: string; label: string }> = [];
  const totalArticles = knowledgeData.articles.length;
  const currentSize = Math.max(articles.length, 1);

  for (const group of filterGroups) {
    if (selected[group].length) continue;

    const optionLabels = new Map(knowledgeData.filters[group].map((item) => [item.id, item.label]));
    const counts = new Map<string, number>();

    for (const article of articles) {
      for (const id of article[group] as string[]) {
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
    }

    const best = [...counts.entries()]
      .map(([id, count]) => {
        const globalCount = knowledgeData.articles.filter((article) => (article[group] as string[]).includes(id)).length;
        const currentShare = count / currentSize;
        const globalShare = globalCount / totalArticles;
        const lift = currentShare - globalShare;
        const narrowing = 1 - count / currentSize;

        return {
          count,
          id,
          score: lift * 18 + narrowing * 4 + Math.min(count, 8) * 0.35
        };
      })
      .filter((item) => item.count > 0 && item.count < articles.length)
      .sort((a, b) => b.score - a.score || b.count - a.count)
      .at(0);

    if (best) {
      suggestions.push({
        group,
        id: best.id,
        label: optionLabels.get(best.id) ?? best.id,
        count: best.count
      });
    }
  }

  return suggestions
    .sort((a, b) => {
      const groupPriority = ["conditions", "topics", "stages", "treatments", "audience", "symptoms", "urgency"];
      return groupPriority.indexOf(a.group) - groupPriority.indexOf(b.group);
    })
    .slice(0, 4);
}

function buildCounts(articles: Article[]) {
  const counts: Record<string, Record<string, number>> = { categories: {} };

  for (const group of filterGroups) {
    counts[group] = {};
  }

  for (const article of articles) {
    counts.categories[article.category] = (counts.categories[article.category] ?? 0) + 1;
    for (const group of filterGroups) {
      for (const id of article[group] as string[]) {
        counts[group][id] = (counts[group][id] ?? 0) + 1;
      }
    }
  }

  return counts as Record<FilterGroup | "categories", Record<string, number>>;
}

function labelsFor(ids: string[], group: FilterGroup) {
  const map = new Map(knowledgeData.filters[group].map((item) => [item.id, item.label]));
  return ids.map((id) => map.get(id) ?? id);
}

function uniqueTags(tags: string[]) {
  return [...new Set(tags.filter(Boolean))];
}
