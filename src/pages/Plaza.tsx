import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, MessageCircle, SlidersHorizontal, Sparkles, SquarePen } from 'lucide-react';
import { notices } from '../data/content';
import { useStore } from '../state/context';
import { topics } from '../types';
import type { Topic } from '../types';
import { Empty, PageTitle, SearchBox } from '../components/Common';
import { formatDate } from '../utils';

export function Plaza() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'forum' ? 'forum' : 'notices';
  const { state } = useStore();
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState<Topic>('全部');
  const matches = (item: { title: string; school: string; category: Topic }, text: string) =>
    (state.selectedSchool === '全部高校' ||
      item.school === state.selectedSchool ||
      item.school === '全部高校') &&
    (topic === '全部' || item.category === topic) &&
    `${item.title} ${text} ${item.school}`.toLowerCase().includes(search.trim().toLowerCase());
  const filteredNotices = notices.filter((item) => matches(item, item.excerpt));
  const filteredThreads = state.threads.filter((item) => matches(item, item.content));
  return (
    <div className="page-enter">
      <PageTitle eyebrow="信息与交流，都在这里">校园广场</PageTitle>
      <div className="segments" role="tablist" aria-label="广场内容">
        <button
          type="button"
          role="tab"
          aria-controls="plaza-results"
          aria-selected={tab === 'notices'}
          className={tab === 'notices' ? 'active' : ''}
          id="notices-tab"
          onClick={() => setParams({ tab: 'notices' })}
        >
          通知
        </button>
        <button
          type="button"
          role="tab"
          aria-controls="plaza-results"
          aria-selected={tab === 'forum'}
          className={tab === 'forum' ? 'active' : ''}
          id="forum-tab"
          onClick={() => setParams({ tab: 'forum' })}
        >
          问答讨论
        </button>
      </div>
      <SearchBox
        value={search}
        onChange={setSearch}
        placeholder={tab === 'notices' ? '搜索通知与校园信息' : '搜索问题与讨论'}
      />
      <div className="topic-filters" aria-label="话题筛选">
        {topics.map((item) => (
          <button
            type="button"
            key={item}
            aria-pressed={topic === item}
            className={topic === item ? 'active' : ''}
            onClick={() => setTopic(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="list-context">
        <span>
          <SlidersHorizontal size={13} />
          {state.selectedSchool}
        </span>
        <span>
          {tab === 'notices' ? filteredNotices.length : filteredThreads.length} 条
          {tab === 'notices' ? '通知' : '讨论'}
        </span>
      </div>
      <div
        id="plaza-results"
        role="tabpanel"
        aria-labelledby={tab === 'notices' ? 'notices-tab' : 'forum-tab'}
      >
        {tab === 'notices' ? (
          filteredNotices.map((notice) => (
            <Link className="content-row" key={notice.id} to={`/notice/${notice.id}`}>
              <p className="meta">
                {notice.school} · {notice.source}
              </p>
              <h2>{notice.title}</h2>
              <p className="excerpt">{notice.excerpt}</p>
              <div className="row-bottom">
                <span>
                  {formatDate(notice.date)} · {notice.category}
                </span>
                <span className="ai-label">
                  <Sparkles size={12} />
                  AI 概要
                </span>
              </div>
            </Link>
          ))
        ) : (
          <>
            {!search && topic === '全部' && (
              <div className="topic-summary">
                <span className="ai-label">
                  <Sparkles size={14} />
                  小X 话题速览
                </span>
                <p>实习怎么开始、资料怎么整理、升学怎么选择——看看同学们正在聊什么。</p>
              </div>
            )}
            {filteredThreads.map((thread) => (
              <Link className="content-row" to={`/thread/${thread.id}`} key={thread.id}>
                <p className="meta">
                  {thread.school} · {thread.category}
                </p>
                <h2>{thread.title}</h2>
                <p className="excerpt">
                  {thread.content.slice(0, 62)}
                  {thread.content.length > 62 ? '…' : ''}
                </p>
                <div className="row-bottom">
                  <span>{thread.author}</span>
                  <span>
                    <MessageCircle size={13} />
                    {thread.replies.length} 条回复
                  </span>
                </div>
              </Link>
            ))}
          </>
        )}
        {(tab === 'notices' ? filteredNotices : filteredThreads).length === 0 && (
          <Empty title="还没有找到相关内容">试试其他关键词、话题或高校范围。</Empty>
        )}
      </div>
      {tab === 'forum' && (
        <Link className="primary-button full-width compose-discussion" to="/plaza/new">
          <SquarePen size={17} />
          发起讨论
          <ArrowUpRight size={16} />
        </Link>
      )}
      <p className="demo-note">学校、通知及讨论均为示例内容。</p>
    </div>
  );
}
