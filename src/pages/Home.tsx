import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { suggestedQuestions, notices } from '../data/content';
import { useShell } from '../hooks/useShell';
import { useStore } from '../state/context';

export function Home() {
  const { suggest } = useShell();
  const { state } = useStore();
  const featured =
    state.selectedSchool === '全部高校'
      ? notices[0]!
      : (notices.find((notice) => notice.school === state.selectedSchool) ?? notices[0]!);
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
      <section className="featured-section" aria-label="推荐通知">
        <h2 className="section-label">值得关注</h2>
        <Link className="featured-notice" to={`/notice/${featured.id}`}>
          <div className="featured-meta">
            <span>校园通知</span>
            <span className="badge">新</span>
          </div>
          <h3>{featured.title}</h3>
          <p>
            {featured.tags.join(' · ')}
            <ArrowUpRight size={15} />
          </p>
        </Link>
      </section>
    </div>
  );
}
