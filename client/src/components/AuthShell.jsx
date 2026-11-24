import { BagIcon } from './Logo';
import { useT } from '../i18n';

/** Two-panel auth card: blue promo panel on the left, form on the right. */
export default function AuthShell({ title, subtitle, children }) {
  const t = useT();
  return (
    <div className="container-page py-3 md:py-8">
      <div className="mx-auto flex min-h-[520px] max-w-[860px] flex-col overflow-hidden rounded-sm bg-white shadow-card md:flex-row">
        <div className="relative flex flex-col bg-primary px-8 py-8 text-white md:w-[40%] md:py-10">
          <h1 className="text-2xl font-semibold md:text-[28px]">{title}</h1>
          <p className="mt-3 text-base text-white/80 md:text-lg">{subtitle}</p>
          <div className="mt-auto hidden justify-center pt-10 md:flex">
            <div className="relative">
              <div className="absolute inset-0 -m-6 rounded-full bg-white/10" />
              <BagIcon className="relative h-40 w-40" />
            </div>
          </div>
          <p className="mt-6 hidden text-center text-sm italic text-brand-yellow md:block">{t('Apni Marzi, Apni Shopping')}</p>
        </div>
        <div className="flex flex-1 flex-col px-6 py-6 md:px-9 md:py-8">{children}</div>
      </div>
    </div>
  );
}

export function UnderlineInput({ label, error, ...props }) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <input
        {...props}
        placeholder={label}
        className={`w-full border-b-2 bg-transparent py-2.5 text-[15px] outline-none transition placeholder:text-gray-500 focus:border-primary ${error ? 'border-[#ff6161]' : 'border-gray-200'}`}
      />
      {error && <span className="mt-1 block text-xs text-[#ff6161]">{error}</span>}
    </label>
  );
}
