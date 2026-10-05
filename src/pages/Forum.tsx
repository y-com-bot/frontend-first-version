import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Send, ThumbsUp } from 'lucide-react';
import { Back, BookmarkButton, Empty, PageTitle } from '../components/Common';
import { formatDate } from '../utils';
import { useStore } from '../state/context';
import { schools, topics } from '../types';
import type { School, Topic } from '../types';

export function ThreadDetail() {
  const { id } = useParams();
  const { state, addReply, toggleLike } = useStore();
  const thread = state.threads.find((item) => item.id === id);
  const [reply, setReply] = useState('');
  if (!thread)
    return (
      <Empty
        title="没有找到这条讨论"
        action={
          <Link to="/plaza?tab=forum" className="primary-button">
            返回问答讨论
          </Link>
        }
      >
        可以去广场看看其他话题。
      </Empty>
    );
  return (
    <div className="detail-page page-enter">
      <div className="detail-top">
        <Back to="/plaza?tab=forum" label="问答讨论" />
        <BookmarkButton itemKey={`thread:${thread.id}`} />
      </div>
      <p className="meta">
        {thread.school} · {thread.category}
      </p>
      <h1>{thread.title}</h1>
      <div className="author-line">
        <span className="avatar small">{thread.author.slice(0, 1)}</span>
        <div>
          <span>{thread.author}</span>
          <small>{formatDate(thread.date)}</small>
        </div>
      </div>
      <p className="thread-body">{thread.content}</p>
      <div className="section-heading">
        <h2>同学的回复</h2>
        <span>{thread.replies.length} 条</span>
      </div>
      {thread.replies.length ? (
        thread.replies.map((item) => (
          <article className="reply" key={item.id}>
            <div className="author-line">
              <span className="avatar small">{item.author.slice(0, 1)}</span>
              <div>
                <span>{item.author}</span>
                <small>{item.school}</small>
              </div>
            </div>
            <p>{item.content}</p>
            <div className="reply-bottom">
              <span>{formatDate(item.date)}</span>
              <button
                type="button"
                className={state.likedReplies.includes(item.id) ? 'liked' : ''}
                aria-label={`赞同${item.author}的回复`}
                aria-pressed={state.likedReplies.includes(item.id)}
                onClick={() => toggleLike(item.id)}
              >
                <ThumbsUp size={14} />
                {state.likedReplies.includes(item.id) ? '已赞同' : '赞同'}
              </button>
            </div>
          </article>
        ))
      ) : (
        <p className="quiet-text">还没有回复，分享一下你的想法吧。</p>
      )}
      <form
        className="reply-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (reply.trim()) {
            addReply(thread.id, reply.trim());
            setReply('');
          }
        }}
      >
        <label htmlFor="reply">参与讨论</label>
        <textarea
          id="reply"
          placeholder="分享你的经历或建议…"
          rows={3}
          maxLength={2000}
          value={reply}
          onChange={(event) => setReply(event.target.value)}
        />
        <button className="primary-button" type="submit" disabled={!reply.trim()}>
          <Send size={16} />
          发布回复
        </button>
      </form>
    </div>
  );
}

export function NewThread() {
  const { state, addThread } = useStore();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [school, setSchool] = useState<School>(state.selectedSchool);
  const [category, setCategory] = useState<Topic>('学习');
  return (
    <div className="page-enter">
      <Back to="/plaza?tab=forum" label="问答讨论" />
      <PageTitle eyebrow="把问题说清楚，也听听其他人的经验">发起讨论</PageTitle>
      <form
        className="edit-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!title.trim() || !content.trim()) return;
          navigate(
            `/thread/${addThread({ title: title.trim(), content: content.trim(), school, category })}`,
          );
        }}
      >
        <label>
          讨论标题
          <input
            autoComplete="off"
            placeholder="你想和同学聊什么？"
            maxLength={80}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </label>
        <label>
          具体说说
          <textarea
            rows={5}
            placeholder="补充背景、你的疑问，或已经尝试过的方法…"
            maxLength={3000}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            required
          />
        </label>
        <div className="form-columns">
          <label>
            话题
            <select value={category} onChange={(event) => setCategory(event.target.value as Topic)}>
              {topics
                .filter((x) => x !== '全部')
                .map((topic) => (
                  <option key={topic}>{topic}</option>
                ))}
            </select>
          </label>
          <label>
            高校范围
            <select value={school} onChange={(event) => setSchool(event.target.value as School)}>
              {schools.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="submit"
          className="primary-button full-width"
          disabled={!title.trim() || !content.trim()}
        >
          <Send size={17} />
          发布讨论
        </button>
        <p className="demo-note">发布内容只保存在当前浏览器，供原型体验。</p>
      </form>
    </div>
  );
}
