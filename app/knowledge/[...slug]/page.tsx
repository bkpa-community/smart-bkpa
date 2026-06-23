import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { findArticleBySlug, knowledgeData } from "@/lib/knowledge";

type Props = {
  params: Promise<{ slug: string[] }>;
};

export function generateStaticParams() {
  return knowledgeData.articles.map((article) => ({
    slug: article.slug.split("/")
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = findArticleBySlug(decodeURIComponent(slug.join("/")));

  if (!article) return {};

  return {
    title: `${article.title} | Smart BKPA`,
    description: article.summary
  };
}

export default async function KnowledgeArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = findArticleBySlug(decodeURIComponent(slug.join("/")));

  if (!article) notFound();

  const backHref = "/#finder";

  const tags = [
    article.categoryLabelBn,
    ...article.searchKeywords.filter((tag) => tag !== article.categoryLabelBn)
  ];
  const uniqueTags = [...new Set(tags.filter(Boolean))].slice(0, 10);

  return (
    <main className="article-page">
      <Link className="back-link" href={backHref}>
        ← সব লেখায় ফিরে যান
      </Link>

      <header className="article-hero">
        <div className="article-meta">
          <span>{article.categoryLabelBn}</span>
          <span>•</span>
          <span>{article.readingTimeMinutes} মিনিট পড়া</span>
        </div>
        <h1>{article.title}</h1>
        {article.summary ? <p>{article.summary}</p> : null}
        <div className="tagline">
          {uniqueTags.map((tag, index) => (
            <span className="tag" key={`${tag}-${index}`}>
              {tag}
            </span>
          ))}
        </div>
      </header>

      <article className="article-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
      </article>
    </main>
  );
}
