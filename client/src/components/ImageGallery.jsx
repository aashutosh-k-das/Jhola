import { useEffect, useRef, useState } from 'react';
import { FiX, FiChevronLeft, FiChevronRight, FiZoomIn } from 'react-icons/fi';
import LazyImage from './LazyImage';
import { useT } from '../i18n';
import { formatNumber } from '../utils/format';

function Lightbox({ images, start, onClose }) {
  const t = useT();
  const [i, setI] = useState(start);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setI((x) => (x + 1) % images.length);
      if (e.key === 'ArrowLeft') setI((x) => (x - 1 + images.length) % images.length);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [images.length, onClose]);

  const move = (clientX, clientY, el) => {
    const r = el.getBoundingClientRect();
    setOrigin(`${((clientX - r.left) / r.width) * 100}% ${((clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-white animate-fade-in" role="dialog" aria-modal="true" aria-label={t('Product images')}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <span className="text-sm text-muted">{formatNumber(i + 1)} / {formatNumber(images.length)} · {t(zoom ? 'Tap to zoom out' : 'Tap image to zoom')}</span>
        <button onClick={onClose} aria-label={t('Close')} className="p-1"><FiX size={24} /></button>
      </div>
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <img
          src={images[i]}
          alt=""
          onClick={(e) => { move(e.clientX, e.clientY, e.currentTarget); setZoom(!zoom); }}
          onMouseMove={(e) => zoom && move(e.clientX, e.clientY, e.currentTarget)}
          onTouchMove={(e) => zoom && move(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget)}
          style={{ transform: zoom ? 'scale(2.5)' : 'scale(1)', transformOrigin: origin }}
          className={`max-h-full max-w-full object-contain transition-transform duration-200 ${zoom ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
        />
        {images.length > 1 && (
          <>
            <button onClick={() => { setZoom(false); setI((i - 1 + images.length) % images.length); }} aria-label={t('Previous image')} className="absolute left-2 rounded-full bg-white p-2 shadow-pop"><FiChevronLeft size={22} /></button>
            <button onClick={() => { setZoom(false); setI((i + 1) % images.length); }} aria-label={t('Next image')} className="absolute right-2 rounded-full bg-white p-2 shadow-pop"><FiChevronRight size={22} /></button>
          </>
        )}
      </div>
      <div className="flex justify-center gap-2 overflow-x-auto border-t p-3">
        {images.map((src, idx) => (
          <button key={src} onClick={() => { setZoom(false); setI(idx); }} className={`h-14 w-14 shrink-0 rounded border-2 p-1 ${idx === i ? 'border-primary' : 'border-transparent'}`}>
            <img src={src} alt="" className="h-full w-full object-contain" />
          </button>
        ))}
      </div>
    </div>
  );
}

/** Product images: thumbnails + hover zoom (desktop), swipe carousel (mobile), fullscreen lightbox on click. */
export default function ImageGallery({ images = [], name, overlay }) {
  const t = useT();
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(null); // {x, y} in %
  const [lightbox, setLightbox] = useState(null);
  const scroller = useRef(null);

  useEffect(() => { setActive(0); }, [images]);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <>
      {/* Desktop */}
      <div className="hidden gap-2 md:flex">
        <div className="flex w-16 shrink-0 flex-col gap-1">
          {images.map((src, i) => (
            <button
              key={src}
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              className={`h-16 w-16 border-2 bg-white p-1 ${i === active ? 'border-primary' : 'border-gray-100'}`}
              aria-label={t('Show image {n}', { n: i + 1 })}
            >
              <img src={src} alt="" className="h-full w-full object-contain" loading="lazy" />
            </button>
          ))}
        </div>
        <div
          className="relative aspect-square flex-1 cursor-zoom-in overflow-hidden border border-gray-100 bg-white"
          onMouseMove={onMove}
          onMouseLeave={() => setZoom(null)}
          onClick={() => setLightbox(active)}
        >
          <img
            src={images[active]}
            alt={name}
            className="h-full w-full object-contain p-4 transition-transform duration-150 ease-out"
            style={zoom ? { transform: 'scale(2.2)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
          />
          {overlay}
          {!zoom && (
            <span className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-[11px] text-white">
              <FiZoomIn /> {t('Hover to zoom · click for full view')}
            </span>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="relative md:hidden">
        <div
          ref={scroller}
          onScroll={(e) => setActive(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          className="flex snap-x snap-mandatory overflow-x-auto no-scrollbar"
        >
          {images.map((src, i) => (
            <button key={src} onClick={() => setLightbox(i)} className="w-full shrink-0 snap-center bg-white p-4" aria-label={t('Show image {n}', { n: i + 1 })}>
              <LazyImage src={src} alt={name} eager={i === 0} className="mx-auto aspect-square w-full max-w-sm" />
            </button>
          ))}
        </div>
        {overlay}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((src, i) => <span key={src} className={`h-1.5 rounded-full transition-all ${i === active ? 'w-4 bg-primary' : 'w-1.5 bg-gray-300'}`} />)}
          </div>
        )}
      </div>

      {lightbox !== null && <Lightbox images={images} start={lightbox} onClose={() => setLightbox(null)} />}
    </>
  );
}
