import { Link } from 'react-router-dom';
import { BagIcon } from '../components/Logo';
import { useT } from '../i18n';

export default function NotFound() {
  const t = useT();
  return (
    <div className="container-page py-4">
      <div className="card flex flex-col items-center px-4 py-16 text-center">
        <BagIcon className="h-28 w-28 opacity-40" bag="#c2c8d0" handle="#c2c8d0" smile="#fff" />
        <h1 className="mt-4 text-2xl font-bold">{t('Oops! This page is empty')}</h1>
        <p className="mt-1 text-muted">{t('The page you are looking for doesn’t exist or has moved.')}</p>
        <Link to="/" className="btn-primary mt-6">{t('Go to Homepage')}</Link>
      </div>
    </div>
  );
}
