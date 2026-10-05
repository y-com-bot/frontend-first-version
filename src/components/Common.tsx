import { ArrowLeft, Bookmark, ChevronRight, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useStore } from '../state/context';

export function Back({ to, label = '返回' }: { to: string; label?: string }) {
  const navigate = useNavigate();
  return (
    <button className="back-link" type="button" onClick={() => navigate(to)}>
      <ArrowLeft size={16} />
      {label}
    </button>
  );
}
export function PageTitle({ eyebrow, children }: { eyebrow?: string; children: ReactNode }) {
  return (
    <div className="page-title">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{children}</h1>
    </div>
  );
}
export function Empty({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-symbol" aria-hidden="true">
        ✦
      </span>
      <h2>{title}</h2>
      <p>{children}</p>
      {action}
    </div>
  );
}
export function BookmarkButton({ itemKey }: { itemKey: string }) {
  const { state, toggleBookmark } = useStore();
  const active = state.bookmarks.includes(itemKey);
  return (
    <button
      type="button"
      className={`icon-button ${active ? 'is-bookmarked' : ''}`}
      aria-label={active ? '取消收藏' : '收藏'}
      aria-pressed={active}
      onClick={() => toggleBookmark(itemKey)}
    >
      <Bookmark size={19} fill={active ? 'currentColor' : 'none'} />
    </button>
  );
}
export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="search-box">
      <Search size={17} />
      <input
        type="search"
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
export function RowLink({
  to,
  children,
  secondary,
}: {
  to: string;
  children: ReactNode;
  secondary?: string;
}) {
  return (
    <Link className="row-link" to={to}>
      <span>
        {children}
        {secondary && <small>{secondary}</small>}
      </span>
      <ChevronRight size={17} />
    </Link>
  );
}
