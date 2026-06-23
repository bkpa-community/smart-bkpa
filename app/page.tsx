import KnowledgeFinder from "@/components/KnowledgeFinder";
import { knowledgeData } from "@/lib/knowledge";
import { BookOpen, HeartPulse } from "lucide-react";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-mark">
              <HeartPulse size={20} aria-hidden="true" />
            </span>
            <span>Smart BKPA</span>
          </div>
          <a className="navlink" href="#finder">
            রোগীভিত্তিক জ্ঞান খুঁজুন
          </a>
        </div>
      </header>

      <section className="hero">
        <div className="hero-inner">
          <div>
            <h1>Smart BKPA</h1>
            <p>
              কিডনি রোগ, ডায়ালাইসিস, ট্রান্সপ্লান্ট, ডায়েট, টেস্ট এবং সতর্কতা
              নিয়ে বাংলা কনটেন্টকে রোগীর নিজের অবস্থার সাথে মিলিয়ে পড়ার জন্য
              স্মার্ট ফিল্টার।
            </p>
          </div>
          <div className="hero-stats" aria-label="জ্ঞানভান্ডারের সারাংশ">
            <div className="stat">
              <strong>{knowledgeData.totalArticles}</strong>
              <span>টি প্রস্তুতকৃত লেখা</span>
            </div>
            <div className="stat">
              <strong>{knowledgeData.categories.length}</strong>
              <span>টি কিডনি বিষয়ক বিভাগ</span>
            </div>
          </div>
        </div>
      </section>

      <main className="main" id="finder">
        <div className="profile">
          <h2>
            <BookOpen size={20} aria-hidden="true" /> দ্রুত শুরু করুন
          </h2>
          <p>
            আপনার অবস্থা অনুযায়ী কয়েকটি ট্যাগ বেছে নিন। যেমন উচ্চ রক্তচাপ + CKD
            স্টেজ ৩ + ডায়েট দিলে শুধু সংশ্লিষ্ট লেখাগুলো উপরে আসবে।
          </p>
        </div>
        <Suspense>
          <KnowledgeFinder />
        </Suspense>
      </main>
    </div>
  );
}
