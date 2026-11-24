import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaFacebookF, FaXTwitter, FaYoutube, FaInstagram, FaTiktok, FaGooglePlay, FaApple, FaCcVisa, FaCcMastercard } from 'react-icons/fa6';
import { FiGift, FiHelpCircle, FiBriefcase, FiStar } from 'react-icons/fi';
import { BagIcon } from './Logo';
import LanguageToggle from './LanguageToggle';
import { useT } from '../i18n';
import { localize } from '../utils/format';

const COLUMNS = [
  { title: 'About', links: [['Contact Us', '/pages/contact'], ['About Us', '/pages/about'], ['Careers', '/pages/careers'], ['Jhola Stories', '/pages/stories'], ['Press', '/pages/press']] },
  { title: 'Help', links: [['Payments', '/pages/payments'], ['Shipping', '/pages/shipping'], ['Cancellation & Returns', '/pages/cancellation-returns'], ['FAQ', '/pages/faq'], ['Track Order', '/account/orders']] },
  { title: 'Consumer Policy', links: [['Return Policy', '/pages/return-policy'], ['Terms of Use', '/pages/terms'], ['Security', '/pages/security'], ['Privacy', '/pages/privacy'], ['Grievance Redressal', '/pages/grievance']] },
  { title: 'Shop', links: [['Mobiles', '/category/mobiles'], ['Electronics', '/category/electronics'], ['Fashion', '/category/fashion'], ['Home & Kitchen', '/category/home-kitchen'], ['Beauty', '/category/beauty']] },
];

// Add your real profile URLs here; icons without a URL show "coming soon".
const SOCIAL = [[FaFacebookF, 'Facebook', ''], [FaInstagram, 'Instagram', ''], [FaTiktok, 'TikTok', ''], [FaYoutube, 'YouTube', ''], [FaXTwitter, 'X', '']];
// Add store URLs once the mobile app is published.
const APP_LINKS = { android: '', ios: '' };
const BOTTOM = [[FiBriefcase, 'Become a Seller', '/pages/sell'], [FiStar, 'Advertise', '/pages/advertise'], [FiGift, 'Gift Cards', '/pages/gift-cards'], [FiHelpCircle, 'Help Center', '/pages/help']];

export default function Footer() {
  const t = useT();
  const soon = (what) => (e) => { e.preventDefault(); toast(t(what), { icon: '⏳', id: what }); };
  return (
    <footer className="mt-6 bg-footer text-white">
      {/* App download */}
      <div className="border-b border-white/10">
        <div className="container-page flex flex-col items-center gap-4 py-6 text-center md:flex-row md:justify-between md:text-left">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary"><BagIcon className="h-8 w-8" /></span>
            <div>
              <p className="text-base font-bold">{t('Shopping is better on the Jhola app')}</p>
              <p className="text-xs text-white/60">{t('Exclusive app-only deals, faster checkout and live order tracking.')}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <a href={APP_LINKS.android || '#'} onClick={APP_LINKS.android ? undefined : soon('The Jhola app is coming soon!')} target={APP_LINKS.android ? '_blank' : undefined} rel="noreferrer" className="flex items-center gap-2 rounded-md border border-white/30 bg-black px-3 py-1.5 hover:border-white">
              <FaGooglePlay size={20} />
              <span className="text-left leading-tight"><span className="block text-[9px] uppercase">{t('Get it on')}</span><span className="text-sm font-semibold">Google Play</span></span>
            </a>
            <a href={APP_LINKS.ios || '#'} onClick={APP_LINKS.ios ? undefined : soon('The Jhola app is coming soon!')} target={APP_LINKS.ios ? '_blank' : undefined} rel="noreferrer" className="flex items-center gap-2 rounded-md border border-white/30 bg-black px-3 py-1.5 hover:border-white">
              <FaApple size={22} />
              <span className="text-left leading-tight"><span className="block text-[9px]">{t('Download on the')}</span><span className="text-sm font-semibold">App Store</span></span>
            </a>
          </div>
        </div>
      </div>

      <div className="container-page grid grid-cols-2 gap-6 py-8 text-xs sm:grid-cols-3 lg:grid-cols-6">
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="mb-3 font-medium uppercase text-white/50">{t(col.title)}</p>
            <ul className="space-y-2">
              {col.links.map(([label, to]) => (
                <li key={label}><Link to={to} className="font-medium hover:underline">{t(label)}</Link></li>
              ))}
            </ul>
          </div>
        ))}
        <div className="col-span-2 border-white/10 sm:col-span-1 lg:border-l lg:pl-6">
          <p className="mb-3 font-medium uppercase text-white/50">{t('Mail Us')}</p>
          <p className="leading-relaxed">{t('Jhola Pvt. Ltd.,')}<br />{t('Durbar Marg, Kathmandu-1,')}<br />{t('Bagmati Province, Nepal 44600')}</p>
          <p className="mb-2 mt-4 font-medium uppercase text-white/50">{t('Social')}</p>
          <div className="flex flex-wrap gap-2">
            {SOCIAL.map(([Icon, label, url]) => (
              <a key={label} href={url || '#'} onClick={url ? undefined : soon('Our social media pages are coming soon!')} target={url ? '_blank' : undefined} rel="noreferrer" aria-label={label} title={label} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-primary"><Icon size={14} /></a>
            ))}
          </div>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <p className="mb-3 font-medium uppercase text-white/50">{t('Customer Care')}</p>
          <p className="leading-relaxed">
            {t('Hotline')}: <a href="tel:16600156789" className="text-primary hover:underline">{localize('1660-01-56789')}</a><br />
            {t('Email')}: <a href="mailto:support@jhola.com.np" className="text-primary hover:underline">support@jhola.com.np</a><br />
            {t('Sunday – Friday, 9 AM – 6 PM')}<br />
            {t('PAN / VAT')}: {localize('609876543')}
          </p>
          <p className="mb-2 mt-4 font-medium uppercase text-white/50">{t('Language')}</p>
          <LanguageToggle />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center gap-4 py-5 text-xs md:flex-row md:justify-between">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {BOTTOM.map(([Icon, l, to]) => (
              <Link key={l} to={to} className="flex items-center gap-1.5 hover:underline"><Icon className="text-accent" />{t(l)}</Link>
            ))}
          </div>
          <p>© {localize(`2007-${new Date().getFullYear()}`)} Jhola.com.np</p>
          <div className="flex flex-wrap items-center justify-center gap-2" aria-label={t('Accepted payment methods')}>
            <span className="rounded bg-[#60bb46] px-1.5 py-0.5 text-[10px] font-extrabold text-white">eSewa</span>
            <span className="rounded bg-[#5c2d91] px-1.5 py-0.5 text-[10px] font-extrabold text-white">Khalti</span>
            <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-extrabold text-[#1a4f9c]">connectIPS</span>
            <FaCcVisa className="text-2xl text-white/80" /><FaCcMastercard className="text-2xl text-white/80" />
          </div>
        </div>
      </div>
    </footer>
  );
}
