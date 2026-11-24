import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FaStar, FaCheckCircle } from 'react-icons/fa';
import useFetch from '../hooks/useFetch';
import api from '../utils/api';
import { RatingBadge, StarInput, ratingColor } from './StarRating';
import { Spinner } from './Loader';
import { useT } from '../i18n';
import { formatDate, formatNumber } from '../utils/format';

function ReviewForm({ productId, onDone, onCancel }) {
  const t = useT();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error(t('Please select a star rating'));
    setSaving(true);
    try {
      await api.post(`/products/${productId}/reviews`, { rating, title, comment });
      toast.success(t('Thanks! Your review has been posted'));
      onDone();
    } catch (err) {
      toast.error(t(err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-sm border bg-page/50 p-4">
      <p className="text-sm font-semibold">{t('Rate this product')}</p>
      <StarInput value={rating} onChange={setRating} />
      <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} placeholder={t('Title (optional)')} className="input" />
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={2000} rows={4} placeholder={t('Description — what did you like or dislike?')} className="input resize-y" />
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-buy">{saving ? <Spinner className="h-4 w-4" light /> : t('Submit')}</button>
        <button type="button" onClick={onCancel} className="btn px-4 text-primary">{t('Cancel')}</button>
      </div>
    </form>
  );
}

export default function RatingsReviews({ product, breakdown, onReviewAdded }) {
  const t = useT();
  const user = useSelector((s) => s.auth.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('recent');
  const [writing, setWriting] = useState(false);
  const { data, loading, reload } = useFetch(`/products/${product._id}/reviews?page=${page}&sort=${sort}`);

  const total = Object.values(breakdown || {}).reduce((a, b) => a + b, 0);

  return (
    <section id="reviews" className="border-t px-4 py-5 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{t('Ratings & Reviews')}</h2>
        <button
          onClick={() => (user ? setWriting(true) : navigate('/login', { state: { from: location } }))}
          className="btn-outline px-4 py-2 text-xs shadow-card"
        >
          {t('Rate Product')}
        </button>
      </div>

      {product.numReviews > 0 ? (
        <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-12">
          <div className="text-center">
            <p className="flex items-center justify-center gap-1 text-4xl font-medium">{formatNumber(product.rating, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}<FaStar size={22} /></p>
            <p className="mt-1 text-sm text-muted">{t('{n} Ratings &', { n: product.numReviews })}<br />{t('{n} Reviews', { n: data?.total ?? product.numReviews })}</p>
          </div>
          <div className="w-full max-w-sm space-y-1.5">
            {[5, 4, 3, 2, 1].map((r) => (
              <div key={r} className="flex items-center gap-3 text-xs font-medium">
                <span className="flex w-6 items-center gap-0.5">{formatNumber(r)}<FaStar size={9} /></span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div className={`h-full rounded-full ${ratingColor(r)}`} style={{ width: `${total ? (breakdown[r] / total) * 100 : 0}%` }} />
                </div>
                <span className="w-6 text-right text-muted">{formatNumber(breakdown[r])}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted">{t('No reviews yet. Be the first to review this product!')}</p>
      )}

      {writing && (
        <div className="mt-5">
          <ReviewForm productId={product._id} onCancel={() => setWriting(false)} onDone={() => { setWriting(false); setPage(1); reload(); onReviewAdded?.(); }} />
        </div>
      )}

      {data?.total > 0 && (
        <div className="mt-5 flex items-center gap-2 text-sm">
          <label htmlFor="review-sort" className="text-muted">{t('Sort:')}</label>
          <select id="review-sort" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="rounded-sm border px-2 py-1 text-sm">
            <option value="recent">{t('Most Recent')}</option>
            <option value="positive">{t('Positive First')}</option>
            <option value="negative">{t('Negative First')}</option>
          </select>
        </div>
      )}

      <ul className={`mt-2 divide-y ${loading ? 'opacity-60' : ''}`}>
        {data?.reviews.map((r) => (
          <li key={r._id} className="py-4">
            <div className="flex items-center gap-2">
              <RatingBadge value={r.rating} />
              {r.title && <p className="text-sm font-semibold">{r.title}</p>}
            </div>
            {r.comment && <p className="mt-2 text-sm leading-relaxed">{r.comment}</p>}
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              <span className="font-medium">{r.name}</span>
              {r.verifiedPurchase && <span className="flex items-center gap-1"><FaCheckCircle className="text-muted" /> {t('Certified Buyer')}</span>}
              <span>{formatDate(r.createdAt, { month: 'short', year: 'numeric' })}</span>
            </p>
          </li>
        ))}
      </ul>

      {data?.pages > 1 && (
        <div className="flex items-center justify-between border-t pt-3 text-sm">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="font-semibold text-primary disabled:invisible">‹ {t('Previous')}</button>
          <span className="text-muted">{t('Page {page} of {pages}', { page, pages: data.pages })}</span>
          <button disabled={page >= data.pages} onClick={() => setPage(page + 1)} className="font-semibold text-primary disabled:invisible">{t('Next')} ›</button>
        </div>
      )}
    </section>
  );
}
