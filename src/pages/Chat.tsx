import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowUpRight, FileText, Plus, Sparkles } from 'lucide-react';
import { useStore } from '../state/context';
import { Empty } from '../components/Common';

export function Chat() {
  const { id } = useParams();
  const { state } = useStore();
  const chat = state.conversations.find((x) => x.id === id);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end', behavior: 'instant' });
  }, [chat?.messages.length]);
  if (!chat)
    return (
      <Empty
        title="这段对话暂时找不到"
        action={
          <Link className="primary-button" to="/">
            开始新的对话
          </Link>
        }
      >
        可以回到首页重新提问。
      </Empty>
    );
  const pending = chat.messages.at(-1)?.role === 'user';
  return (
    <div className="chat-page page-enter">
      <div className="chat-top">
        <span>和小X聊聊</span>
        <Link to="/" className="text-button">
          <Plus size={16} />
          新对话
        </Link>
      </div>
      <p className="demo-note">演示回答 · 未连接真实 AI 服务</p>
      {chat.messages.map((message) => (
        <article className={`message ${message.role}`} key={message.id}>
          {message.role === 'assistant' && (
            <div className="assistant-label">
              <Sparkles size={15} />
              小X
            </div>
          )}
          <div className="message-text">{message.text}</div>
          {message.files?.map((file) => (
            <div key={file.id} className="message-file">
              <FileText size={15} />
              {file.name}
            </div>
          ))}
          {message.references && (
            <div className="reference-list">
              <span className="overline">相关内容</span>
              {message.references.map((reference) => (
                <Link key={reference.href} to={reference.href}>
                  {reference.label}
                  <ArrowUpRight size={15} />
                </Link>
              ))}
            </div>
          )}
        </article>
      ))}
      {pending && (
        <div className="thinking" role="status">
          <Sparkles size={15} />
          <span>正在整理思路</span>
          <span className="thinking-dots" aria-hidden="true">
            ···
          </span>
        </div>
      )}
      <div ref={end} />
    </div>
  );
}
