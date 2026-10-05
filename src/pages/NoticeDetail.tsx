import { Link, useParams } from 'react-router-dom';
import { Download, Sparkles } from 'lucide-react';
import { notices } from '../data/content';
import { Back, BookmarkButton, Empty } from '../components/Common';
import { downloadText, formatDate } from '../utils';
import { useShell } from '../hooks/useShell';
import { useStore } from '../state/context';

export function NoticeDetail() {
  const { id } = useParams();
  const notice = notices.find((item) => item.id === id);
  const { showAdvice } = useShell();
  const { notify } = useStore();
  if (!notice)
    return (
      <Empty
        title="没有找到这条通知"
        action={
          <Link to="/plaza" className="primary-button">
            返回广场
          </Link>
        }
      >
        可以查看其他校园信息。
      </Empty>
    );
  return (
    <article className="detail-page page-enter">
      <div className="detail-top">
        <Back to="/plaza?tab=notices" label="校园通知" />
        <BookmarkButton itemKey={`notice:${notice.id}`} />
      </div>
      <p className="meta">
        {notice.school} · {notice.source} · {formatDate(notice.date)}
      </p>
      <h1>{notice.title}</h1>
      <div className="tag-list">
        {notice.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <section className="summary-panel">
        <span className="ai-label">
          <Sparkles size={15} />
          小X 概要
        </span>
        <p>{notice.summary}</p>
      </section>
      <div className="article-body">
        {notice.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </div>
      <button
        type="button"
        className="download-row"
        onClick={() => {
          downloadText(
            notice.attachment,
            `校园助手 · 示例资料\n${notice.title}\n\n${notice.sections.map((section) => `${section.heading}\n${section.body}`).join('\n\n')}`,
          );
          notify('示例资料已下载');
        }}
      >
        <Download size={18} />
        <span>
          {notice.attachment}
          <small>示例资料 · TXT</small>
        </span>
      </button>
      <button
        type="button"
        className="primary-button full-width"
        onClick={() => showAdvice(notice)}
      >
        <Sparkles size={17} />
        查看小X 建议
      </button>
      <p className="demo-note">示例通知，不作为真实校园办事依据。</p>
    </article>
  );
}
