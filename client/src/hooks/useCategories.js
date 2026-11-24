import { useEffect, useState } from 'react';
import api from '../utils/api';

let cache = null;
let inflight = null;

/** Categories rarely change: fetch once and share across components. */
export default function useCategories() {
  const [categories, setCategories] = useState(cache || []);
  useEffect(() => {
    if (cache) return;
    inflight ||= api.get('/categories').then((r) => (cache = r.data)).catch(() => { inflight = null; return []; });
    inflight.then((c) => setCategories(c));
  }, []);
  return categories;
}
