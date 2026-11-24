import { Link } from 'react-router-dom';
import { useT } from '../i18n';

export function BagIcon({ className = 'h-8 w-8', bag = '#fff', handle = '#ffe500', smile = '#2874f0' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path d="M22 24v-3a10 10 0 0 1 20 0v3" fill="none" stroke={handle} strokeWidth="4.5" strokeLinecap="round" />
      <path d="M12 24h40l-3.2 28.6A4.5 4.5 0 0 1 44.3 57H19.7a4.5 4.5 0 0 1-4.5-4.4z" fill={bag} />
      <path d="M25 35a7 7 0 0 0 14 0" fill="none" stroke={smile} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({ variant = 'light', showTagline = true }) {
  const t = useT();
  const light = variant === 'light';
  return (
    <Link to="/" className="flex shrink-0 items-center gap-1.5" aria-label={t('Jhola home')}>
      <BagIcon className="h-8 w-8 md:h-9 md:w-9" bag={light ? '#fff' : '#2874f0'} smile={light ? '#2874f0' : '#fff'} handle={light ? '#ffe500' : '#ff9f00'} />
      <span className="flex flex-col leading-none">
        <span className={`text-xl font-extrabold italic tracking-tight md:text-[22px] ${light ? 'text-white' : 'text-primary'}`}>{t('Jhola')}</span>
        {showTagline && (
          <span className={`mt-0.5 hidden text-[10px] font-medium italic sm:block ${light ? 'text-brand-yellow' : 'text-muted'}`}>
            {t('Apni Marzi, Apni Shopping')}
          </span>
        )}
      </span>
    </Link>
  );
}
