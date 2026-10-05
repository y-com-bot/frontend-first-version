import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const focused = document.activeElement;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (focused instanceof HTMLElement) focused.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="sheet-dialog"
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="sheet-content">
        <div className="sheet-handle" aria-hidden="true" />
        <header>
          <h2>{title}</h2>
          <button type="button" className="icon-button" aria-label="关闭" onClick={onClose}>
            <X size={19} />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
