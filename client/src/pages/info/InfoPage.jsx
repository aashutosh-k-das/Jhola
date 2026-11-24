import { useEffect, useState } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import { FiPhone, FiMail, FiMapPin, FiChevronDown, FiChevronRight, FiPackage } from 'react-icons/fi';
import { PAGES, PAGE_GROUPS, SUPPORT } from './content';
import { useLang } from '../../i18n';
import { localize } from '../../utils/format';
import NotFound from '../NotFound';

function ContactCards() {
  const { t } = useLang();
  const cards = [
    { icon: FiPhone, title: 'Call us', value: localize(SUPPORT.phone), href: `tel:${SUPPORT.phone.replace(/-/g, '')}`, sub: 'Sunday – Friday, 9 AM – 6 PM' },
    { icon: FiMail, title: 'Email us', value: SUPPORT.email, href: `mailto:${SUPPORT.email}`, sub: 'We reply within one working day' },
    { icon: FiMapPin, title: 'Visit us', value: t('Durbar Marg, Kathmandu-1,'), sub: 'Bagmati Province, Nepal 44600' },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cards.map(({ icon: Icon, title, value, href, sub }) => {
        const body = (
          <>
            <Icon className="text-primary" size={22} />
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted">{t(title)}</p>
            <p className="mt-0.5 break-all font-semibold">{value}</p>
            <p className="mt-0.5 text-xs text-muted">{t(sub)}</p>
          </>
        );
        return href ? (
          <a key={title} href={href} className="rounded-md border p-4 transition hover:border-primary hover:shadow-card">{body}</a>
        ) : (
          <div key={title} className="rounded-md border p-4">{body}</div>
        );
      })}
    </div>
  );
}

function FaqItem({ q, a, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b last:border-0">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 py-4 text-left font-medium">
        {q}
        <FiChevronDown className={`shrink-0 text-muted transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="pb-4 text-sm leading-relaxed text-gray-700 animate-fade-in">{a}</p>}
    </div>
  );
}

export default function InfoPage() {
  const { slug } = useParams();
  const { lang, t } = useLang();
  const page = PAGES[slug];
  const pick = (o) => (o ? o[lang] || o.en : '');

  useEffect(() => {
    if (page) document.title = `${pick(page.title)} | ${t('Jhola')}`;
    return () => { document.title = 'Jhola — Apni Marzi, Apni Shopping'; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, lang]);

  if (!page) return <NotFound />;

  return (
    <div className="container-page py-2 md:py-3">
      <div className="grid gap-3 lg:grid-cols-[240px_1fr]">
        <aside className="card hidden self-start lg:block">
          {PAGE_GROUPS.map((g) => (
            <div key={g} className="border-b py-2 last:border-0">
              <p className="px-4 py-1 text-xs font-semibold uppercase tracking-wide text-muted">{t(g)}</p>
              {Object.entries(PAGES).filter(([, p]) => p.group === g).map(([s, p]) => (
                <NavLink key={s} to={`/pages/${s}`} className={({ isActive }) => `block px-4 py-1.5 text-sm ${isActive ? 'font-semibold text-primary' : 'text-gray-700 hover:text-primary'}`}>
                  {pick(p.title)}
                </NavLink>
              ))}
            </div>
          ))}
        </aside>

        <article className="card min-w-0 p-5 sm:p-8">
          <nav className="mb-2 flex items-center gap-1 text-xs text-muted" aria-label={t('Breadcrumb')}>
            <Link to="/" className="hover:text-primary">{t('Home')}</Link>
            <FiChevronRight size={11} />
            <span>{t(page.group)}</span>
          </nav>
          <h1 className="text-2xl font-bold sm:text-3xl">{pick(page.title)}</h1>
          {page.intro && <p className="mt-2 max-w-2xl text-gray-700">{pick(page.intro)}</p>}

          {page.contact && <div className="mt-6"><ContactCards /></div>}

          {page.faq ? (
            <div className="mt-4 max-w-3xl">
              {page.sections.map((s, i) => <FaqItem key={s.h.en} q={pick(s.h)} a={pick(s.p)} defaultOpen={i === 0} />)}
            </div>
          ) : (
            <div className="mt-6 max-w-3xl space-y-6">
              {page.sections.map((s) => (
                <section key={s.h.en}>
                  <h2 className="text-lg font-semibold">{pick(s.h)}</h2>
                  {s.p && <p className="mt-1.5 leading-relaxed text-gray-700">{pick(s.p)}</p>}
                  {s.list && (
                    <ul className="mt-2 list-disc space-y-1.5 pl-5 text-gray-700 marker:text-primary">
                      {s.list.map((li) => <li key={li.en}>{pick(li)}</li>)}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          )}

          {page.links && (
            <div className="mt-8 grid gap-2 sm:grid-cols-2">
              <Link to="/account/orders" className="flex items-center gap-3 rounded-md border p-4 hover:border-primary">
                <FiPackage className="text-primary" /> <span className="flex-1 font-medium">{t('Track Order')}</span> <FiChevronRight className="text-muted" />
              </Link>
              {page.links.map((s) => (
                <Link key={s} to={`/pages/${s}`} className="flex items-center gap-3 rounded-md border p-4 hover:border-primary">
                  <span className="flex-1 font-medium">{pick(PAGES[s].title)}</span> <FiChevronRight className="text-muted" />
                </Link>
              ))}
            </div>
          )}

          {slug !== 'contact' && slug !== 'help' && (
            <p className="mt-10 border-t pt-4 text-sm text-muted">
              {t('Still need help?')} <Link to="/pages/contact" className="font-semibold text-primary">{t('Contact Us')}</Link>
            </p>
          )}
        </article>
      </div>
    </div>
  );
}
