import { forwardRef, useRef } from 'react';
import { ArrowUp, Paperclip, X } from 'lucide-react';
import type { FileInfo } from '../types';
import { useStore } from '../state/context';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onFocusChange: (value: boolean) => void;
  files: FileInfo[];
  onFilesChange: (files: FileInfo[]) => void;
  busy: boolean;
}
export const Composer = forwardRef<HTMLTextAreaElement, Props>(function Composer(
  { value, onChange, onSubmit, onFocusChange, files, onFilesChange, busy },
  ref,
) {
  const fileInput = useRef<HTMLInputElement>(null);
  const { notify } = useStore();
  const readFiles = (selected: FileList | null) => {
    if (!selected) return;
    if (Array.from(selected).some((file) => file.size > 20 * 1024 * 1024)) {
      notify('请选择小于 20MB 的文件');
      return;
    }
    const additions = Array.from(selected)
      .slice(0, Math.max(0, 3 - files.length))
      .map((file) => ({ id: crypto.randomUUID(), name: file.name, size: file.size }));
    onFilesChange([...files, ...additions]);
    notify('资料已添加 · 此原型不上传文件');
    if (fileInput.current) fileInput.current.value = '';
  };
  return (
    <div className="composer-wrap">
      {files.length > 0 && (
        <div className="attached-files">
          {files.map((file) => (
            <span key={file.id}>
              <Paperclip size={13} />
              <span>{file.name}</span>
              <button
                type="button"
                aria-label={`移除 ${file.name}`}
                onClick={() => onFilesChange(files.filter((x) => x.id !== file.id))}
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
      <form
        className="composer glass-surface"
        onSubmit={(event) => {
          event.preventDefault();
          if (value.trim() && !busy) onSubmit();
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null))
            onFocusChange(false);
        }}
      >
        <input
          className="sr-only"
          ref={fileInput}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.md"
          multiple
          tabIndex={-1}
          aria-label="选择资料文件"
          onChange={(event) => readFiles(event.target.files)}
        />
        <button
          type="button"
          className="icon-button attachment-button"
          aria-label="添加资料"
          title="添加资料"
          disabled={busy || files.length >= 3}
          onClick={() => fileInput.current?.click()}
        >
          <Paperclip size={20} />
        </button>
        <textarea
          ref={ref}
          rows={1}
          maxLength={3000}
          aria-label="向小X提问"
          placeholder={busy ? '小X 正在整理思路…' : '有什么想问的？'}
          value={value}
          disabled={busy}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => onFocusChange(true)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              if (value.trim() && !busy) onSubmit();
            }
          }}
        />
        <button
          type="submit"
          className="send-button"
          aria-label="发送问题"
          disabled={!value.trim() || busy}
        >
          <ArrowUp size={20} />
        </button>
      </form>
    </div>
  );
});
