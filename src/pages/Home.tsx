import { useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { suggestedQuestions } from '../data/content';
import { useShell } from '../hooks/useShell';
import { HomeRecommendations } from '../features/recommendations/HomeRecommendations';

export function Home() {
  const { suggest } = useShell();
  const location = useLocation();
  useEffect(() => {
    if (location.hash === '#recommendations')
      document
        .getElementById('recommendations')
        ?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [location.hash]);
  return (
    <div className="home-page page-enter">
      <div className="home-hero">
        <p className="eyebrow">学习与生活，都可以聊聊</p>
        <h1>
          今天有什么
          <br />
          想问的？
        </h1>
        <p className="hero-description">从一个疑问，找到下一步的方向。</p>
      </div>
      <section className="question-section" aria-label="推荐问题">
        <h2 className="section-label">从这里开始</h2>
        {suggestedQuestions.map((question) => (
          <button
            type="button"
            className="question-row"
            key={question}
            onClick={() => suggest(question)}
          >
            <span>{question}</span>
            <ArrowUpRight size={17} />
          </button>
        ))}
      </section>
      <HomeRecommendations />
    </div>
  );
}
