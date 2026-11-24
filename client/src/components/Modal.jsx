import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, actions, size = 'max-w-md' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />
      <div className={`relative w-full ${size} rounded-t-xl bg-white shadow-xl animate-slide-up sm:rounded-md sm:animate-fade-in`}>
        {title && <h3 className="border-b px-5 py-4 text-base font-semibold">{title}</h3>}
        <div className="px-5 py-4">{children}</div>
        {actions && <div className="flex justify-end gap-3 border-t px-5 py-3">{actions}</div>}
      </div>
    </div>
  );
}
