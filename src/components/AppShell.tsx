import { useRef, useState } from 'react';
import { Blocks, ChevronDown, Check, MessagesSquare, Plus, UserRound } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useViewport } from '../hooks/useViewport';
import type { ShellContext } from '../hooks/useShell';
import type { FileInfo, Notice } from '../types';
import { schools } from '../types';
import { useStore } from '../state/context';
import { Composer } from './Composer';
import { Sheet } from './Sheet';
import { BrandMark } from './BrandMark';

const tabs = [
  { to: '/mine', label: '我的', icon: UserRound },
  { to: '/', label: '小X', icon: BrandMark },
  { to: '/plaza', label: '广场', icon: MessagesSquare },
  { to: '/agents', label: '智能体', icon: Blocks },
];

export function AppShell() {
  useViewport();
  const { state, sendMessage, setSchool, toast, storageAvailable } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [draft, setDraft] = useState('');
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [composing, setComposing] = useState(false);
  const [schoolOpen, setSchoolOpen] = useState(false);
  const [advice, setAdvice] = useState<Notice | null>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const content = useRef<HTMLElement>(null);
  const chatId = location.pathname.startsWith('/chat/')
    ? location.pathname.split('/')[2]
    : undefined;
  const showComposer = location.pathname === '/' || Boolean(chatId);
  const chat = state.conversations.find((x) => x.id === chatId);
  const busy = chat?.messages.at(-1)?.role === 'user';
  const activeTab = location.pathname.startsWith('/chat/')
    ? '/'
    : location.pathname.startsWith('/notice/') || location.pathname.startsWith('/thread/')
      ? '/plaza'
      : location.pathname.startsWith('/agents')
        ? '/agents'
        : location.pathname.startsWith('/mine')
          ? '/mine'
          : location.pathname;

  const submit = () => {
    if (!draft.trim() || busy) return;
    const key = sendMessage(draft.trim(), chatId, files);
    setDraft('');
    setFiles([]);
    setComposing(false);
    field.current?.blur();
    navigate(`/chat/${key}`);
  };
  const suggest = (question: string) => {
    setDraft(question);
    if (location.pathname !== '/' && !chatId) navigate('/');
    requestAnimationFrame(() => field.current?.focus());
  };
  const context: ShellContext = { suggest, composing, setComposing, showAdvice: setAdvice };

  return (
    <div className="desktop-stage">
      <aside className="desktop-caption" aria-label="原型说明">
        <span className="desktop-mark">
          <BrandMark size={28} />
        </span>
        <p>
          一点疑问，
          <br />
          一个新的方向。
        </p>
        <span>小X · 校园助手</span>
        <small>前端交互原型 · 所有内容均为示例</small>
      </aside>
      <div className={`app-window ${composing && showComposer ? 'is-composing' : ''}`}>
        <header className="app-header">
          <NavLink to="/" className="brand" aria-label="小X校园助手首页">
            <span className="brand-symbol">
              <BrandMark size={23} />
            </span>
            <span>
              小X <span className="brand-divider">·</span> 校园助手
            </span>
          </NavLink>
          <button
            type="button"
            className="school-button"
            aria-haspopup="dialog"
            onClick={() => setSchoolOpen(true)}
          >
            {state.selectedSchool}
            <ChevronDown size={14} />
          </button>
        </header>
        {!storageAvailable && (
          <p className="storage-warning" role="status">
            浏览器存储空间不足，刷新后可能无法保留此次操作。
          </p>
        )}
        <main
          className="app-main"
          ref={content}
          key={location.pathname + location.search}
          id="main-content"
        >
          <Outlet context={context} />
        </main>
        <footer className={`bottom-dock ${showComposer ? 'has-composer' : ''}`}>
          {showComposer && (
            <Composer
              ref={field}
              value={draft}
              onChange={setDraft}
              onSubmit={submit}
              onFocusChange={setComposing}
              files={files}
              onFilesChange={setFiles}
              busy={Boolean(busy)}
            />
          )}
          <nav className="tab-bar glass-surface" aria-label="主要页面">
            {tabs.map((tab) => (
              <Link
                key={tab.to}
                to={tab.to}
                aria-current={activeTab === tab.to ? 'page' : undefined}
                className={`tab-item ${activeTab === tab.to ? 'selected' : ''}`}
                onClick={() => {
                  setComposing(false);
                  field.current?.blur();
                }}
              >
                <tab.icon size={20} aria-hidden="true" />
                <span>{tab.label}</span>
              </Link>
            ))}
          </nav>
        </footer>
        {toast && (
          <div className="toast" role="status">
            <Check size={16} />
            {toast}
          </div>
        )}
      </div>
      {schoolOpen && (
        <Sheet title="选择高校范围" onClose={() => setSchoolOpen(false)}>
          <p className="sheet-description">通知按学校标注，也可以看看不同校园的讨论。</p>
          <div className="school-options">
            {schools.map((school) => (
              <button
                type="button"
                key={school}
                onClick={() => {
                  setSchool(school);
                  setSchoolOpen(false);
                }}
              >
                <span>{school}</span>
                {state.selectedSchool === school && <Check size={18} />}
              </button>
            ))}
          </div>
          <p className="demo-note">学校名称用于原型演示。</p>
        </Sheet>
      )}
      {advice && (
        <Sheet title="小X 的建议" onClose={() => setAdvice(null)}>
          <span className="overline">根据这条通知，可以这样准备</span>
          <ol className="advice-list">
            {advice.advice.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
          <button
            type="button"
            className="primary-button full-width"
            onClick={() => {
              suggest(`关于${advice.title}，我该怎么准备？`);
              setAdvice(null);
            }}
          >
            <Plus size={17} />
            继续问问小X
          </button>
          <p className="demo-note">建议为演示内容，请以所在学校的正式要求为准。</p>
        </Sheet>
      )}
    </div>
  );
}
