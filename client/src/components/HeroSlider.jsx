import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { HERO_SLIDES } from '../utils/constants';
import { useT } from '../i18n';
import { formatPrice } from '../utils/format';

export default function HeroSlider({ slides = HERO_SLIDES, interval = 4500 }) {
  const t = useT();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);
  const n = slides.length;
  const go = useCallback((i) => setIndex(((i % n) + n) % n), [n]);

  useEffect(() => {
    if (paused) return undefined;
    const t = setInterval(() => setIndex((i) => (i + 1) % n), interval);
    return () => clearInterval(t);
  }, [paused, n, interval]);

  return (
    <section
      className="group relative overflow-hidden rounded-sm shadow-card"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; setPaused(true); }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - (touchX.current ?? 0);
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        setPaused(false);
      }}
      aria-roledescription="carousel"
      aria-label={t('Offers')}
    >
      <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((s, i) => (
          <Link
            key={s.title}
            to={s.to}
            aria-hidden={i !== index}
            tabIndex={i === index ? 0 : -1}
            className={`relative flex h-44 w-full shrink-0 items-center overflow-hidden bg-gradient-to-r px-5 text-white sm:h-56 sm:px-10 md:h-64 lg:h-72 lg:px-20 ${s.bg}`}
          >
            <div className="absolute -right-10 -top-16 h-72 w-72 rounded-full bg-white/10" />
            <div className="absolute -bottom-24 right-40 h-60 w-60 rounded-full bg-white/10" />
            <div className="relative z-10 max-w-[58%] sm:max-w-[50%]">
              <p className="mb-1 inline-block rounded-sm bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest backdrop-blur sm:text-xs">{t(s.kicker)}</p>
              <h2 className="text-xl font-extrabold leading-tight sm:text-3xl lg:text-[40px]">{t(s.title, s.price ? { price: formatPrice(s.price) } : undefined)}</h2>
              <p className="mt-1 text-xs text-white/90 sm:mt-2 sm:text-base">{t(s.subtitle)}</p>
              <span className="mt-3 inline-block rounded-sm bg-white px-3 py-1.5 text-xs font-bold text-ink shadow sm:mt-5 sm:px-5 sm:py-2 sm:text-sm">{t(s.cta)} →</span>
            </div>
            <img
              src={s.image}
              alt=""
              loading={i === 0 ? 'eager' : 'lazy'}
              className="absolute bottom-2 right-3 h-[85%] max-w-[45%] object-contain drop-shadow-[0_18px_25px_rgba(0,0,0,0.35)] sm:right-10 lg:right-24"
            />
          </Link>
        ))}
      </div>

      <button onClick={() => go(index - 1)} aria-label={t('Previous slide')} className="absolute left-0 top-1/2 hidden h-24 -translate-y-1/2 items-center rounded-r bg-white/90 px-2 text-ink opacity-0 shadow transition group-hover:opacity-100 md:flex">
        <FiChevronLeft size={24} />
      </button>
      <button onClick={() => go(index + 1)} aria-label={t('Next slide')} className="absolute right-0 top-1/2 hidden h-24 -translate-y-1/2 items-center rounded-l bg-white/90 px-2 text-ink opacity-0 shadow transition group-hover:opacity-100 md:flex">
        <FiChevronRight size={24} />
      </button>
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
        {slides.map((s, i) => (
          <button key={s.title} onClick={() => go(i)} aria-label={t('Go to slide {n}', { n: i + 1 })}
            className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`} />
        ))}
      </div>
    </section>
  );
}
