import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  ChevronRight,
  FileText,
  MessageCircle,
  Settings2,
  Trash2,
  UserRound,
} from 'lucide-react';
import { Back, Empty, PageTitle, RowLink, SearchBox } from '../components/Common';
import { formatDate } from '../utils';
import { useStore } from '../state/context';
import { notices } from '../data/content';
import { schools } from '../types';
import type { School } from '../types';
import { Sheet } from '../components/Sheet';
import { getPreparation, researchTitle } from '../features/matter/model';

export function Mine() {
  const { state } = useStore();
  return (
    <div className="mine-page page-enter">
      <div className="profile-hero">
        <span className="avatar large">
          <UserRound size={29} />
        </span>
        <h1>{state.profile.name}</h1>
        <Link className="profile-school" to="/mine/settings">
          {state.profile.school === '全部高校' ? '设置我的学校' : state.profile.school}
          <ChevronRight size={14} />
        </Link>
      </div>
      <div className="personal-grid">
        <Link to="/mine/bookmarks">
          <Bookmark size={19} />
          <span>我的收藏</span>
          <small>{state.bookmarks.length} 条</small>
        </Link>
        <Link to="/mine/documents">
          <FileText size={19} />
          <span>资料档案</span>
          <small>{state.documents.length} 份</small>
        </Link>
        <Link to="/mine/settings">
          <Settings2 size={19} />
          <span>设置</span>
          <small>个人资料</small>
        </Link>
      </div>
      {state.conversations.some((chat) => chat.matter?.continued) && (
        <section aria-label="正在准备的事项">
          <div className="section-heading">
            <h2>正在准备</h2>
          </div>
          {state.conversations
            .filter((chat) => chat.matter?.continued)
            .slice(0, 3)
            .map((chat) => (
              <RowLink
                key={chat.id}
                to={`/chat/${chat.id}#preparation`}
                secondary={`已完成 ${getPreparation(chat.matter!).filter((t) => t.complete).length}/4 · 示例事项`}
              >
                {researchTitle}
              </RowLink>
            ))}
        </section>
      )}
      <div className="section-heading">
        <h2>最近的对话</h2>
        <Link to="/mine/history" className="text-button">
          全部
          <ChevronRight size={14} />
        </Link>
      </div>
      {state.conversations.length ? (
        state.conversations.slice(0, 4).map((chat) => (
          <RowLink key={chat.id} to={`/chat/${chat.id}`} secondary={formatDate(chat.updatedAt)}>
            {chat.title}
          </RowLink>
        ))
      ) : (
        <div className="history-empty">
          <MessageCircle size={21} />
          <p>
            从一个问题开始，
            <br />
            这里会留住你的思考。
          </p>
          <Link to="/" className="text-button">
            问问小X
            <ChevronRight size={15} />
          </Link>
        </div>
      )}
      <p className="demo-note">收藏、对话与资料记录保存在当前浏览器。</p>
    </div>
  );
}

export function Bookmarks() {
  const { state } = useStore();
  const savedNotices = notices.filter((item) => state.bookmarks.includes(`notice:${item.id}`));
  const savedThreads = state.threads.filter((item) =>
    state.bookmarks.includes(`thread:${item.id}`),
  );
  return (
    <div className="page-enter">
      <Back to="/mine" label="我的" />
      <PageTitle eyebrow="值得留下的内容，下次更容易找到">我的收藏</PageTitle>
      {[
        ...savedNotices.map((item) => (
          <RowLink
            key={`n-${item.id}`}
            to={`/notice/${item.id}`}
            secondary={`校园通知 · ${item.school}`}
          >
            {item.title}
          </RowLink>
        )),
        ...savedThreads.map((item) => (
          <RowLink
            key={`t-${item.id}`}
            to={`/thread/${item.id}`}
            secondary={`问答讨论 · ${item.school}`}
          >
            {item.title}
          </RowLink>
        )),
      ]}
      {!savedNotices.length && !savedThreads.length && (
        <Empty
          title="还没有收藏内容"
          action={
            <Link to="/plaza" className="primary-button">
              去广场看看
            </Link>
          }
        >
          在通知或讨论详情页点击收藏，就能在这里找到。
        </Empty>
      )}
    </div>
  );
}

export function History() {
  const { state, deleteChat } = useStore();
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const chats = state.conversations.filter((chat) => chat.title.includes(search.trim()));
  return (
    <div className="page-enter">
      <Back to="/mine" label="我的" />
      <PageTitle>对话历史</PageTitle>
      <SearchBox value={search} onChange={setSearch} placeholder="搜索之前的问题" />
      {chats.map((chat) => (
        <div className="history-row" key={chat.id}>
          <Link to={`/chat/${chat.id}`}>
            <span>{chat.title}</span>
            <small>
              {formatDate(chat.updatedAt)} · {chat.messages.length} 条消息
            </small>
          </Link>
          <button
            type="button"
            className="icon-button"
            aria-label={`删除对话 ${chat.title}`}
            onClick={() => setDeleting(chat.id)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      {!chats.length && (
        <Empty title={search ? '没有找到相关对话' : '还没有对话记录'}>
          试着回到首页，问一个感兴趣的问题。
        </Empty>
      )}
      {deleting && (
        <Sheet title="删除这段对话？" onClose={() => setDeleting(null)}>
          <p className="sheet-description">删除后，这段对话将从当前浏览器的历史中移除。</p>
          <button
            className="danger-button full-width"
            type="button"
            onClick={() => {
              deleteChat(deleting);
              setDeleting(null);
            }}
          >
            删除对话
          </button>
        </Sheet>
      )}
    </div>
  );
}

export function Documents() {
  const { state } = useStore();
  return (
    <div className="page-enter">
      <Back to="/mine" label="我的" />
      <PageTitle eyebrow="工具使用过的资料，在这里回顾">资料档案</PageTitle>
      {state.documents.map((doc) => (
        <RowLink
          key={doc.id}
          to={
            doc.matterChatId
              ? `/agents/review?matter=${encodeURIComponent(doc.matterChatId)}`
              : `/agents/${doc.tool}?record=${doc.id}`
          }
          secondary={`${doc.tool === 'review' ? '文件审查' : '资料整理'} · ${formatDate(doc.date)}`}
        >
          {doc.name}
        </RowLink>
      ))}
      {!state.documents.length && (
        <Empty
          title="还没有资料记录"
          action={
            <Link to="/agents" className="primary-button">
              看看校园工具箱
            </Link>
          }
        >
          体验文件工具后，资料名称与示例结果会记录于此。
        </Empty>
      )}
      <p className="demo-note">此处仅保存资料名称与示例记录，不保存原始文件。</p>
    </div>
  );
}

export function Settings() {
  const { state, saveProfile } = useStore();
  const [profile, setProfile] = useState(state.profile);
  return (
    <div className="page-enter">
      <Back to="/mine" label="我的" />
      <PageTitle eyebrow="让校园助手更了解你一点">个人设置</PageTitle>
      <form
        className="edit-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (profile.name.trim())
            saveProfile({ ...profile, name: profile.name.trim(), major: profile.major.trim() });
        }}
      >
        <label>
          昵称
          <input
            autoComplete="nickname"
            value={profile.name}
            maxLength={20}
            required
            onChange={(event) => setProfile({ ...profile, name: event.target.value })}
          />
        </label>
        <label>
          我的学校
          <select
            value={profile.school}
            onChange={(event) => setProfile({ ...profile, school: event.target.value as School })}
          >
            {schools.map((school) => (
              <option key={school}>{school}</option>
            ))}
          </select>
        </label>
        <div className="form-columns">
          <label>
            年级
            <select
              value={profile.year}
              onChange={(event) => setProfile({ ...profile, year: event.target.value })}
            >
              {['大一', '大二', '大三', '大四', '研究生', '其他'].map((year) => (
                <option key={year}>{year}</option>
              ))}
            </select>
          </label>
          <label>
            专业
            <input
              value={profile.major}
              maxLength={40}
              placeholder="选填"
              onChange={(event) => setProfile({ ...profile, major: event.target.value })}
            />
          </label>
        </div>
        <button type="submit" className="primary-button full-width" disabled={!profile.name.trim()}>
          保存设置
        </button>
        <p className="demo-note">个人资料仅保存在当前浏览器。</p>
      </form>
    </div>
  );
}
