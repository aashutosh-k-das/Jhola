import { useCallback, useEffect, useState } from 'react';
import api from '../utils/api';

/** GET `url` (relative to /api) and track loading/error. Pass null to skip. */
export default function useFetch(url) {
  const [state, setState] = useState({ data: null, loading: Boolean(url), error: null });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!url) return undefined;
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    api
      .get(url, { signal: controller.signal })
      .then((res) => setState({ data: res.data, loading: false, error: null }))
      .catch((err) => {
        if (!controller.signal.aborted) setState({ data: null, loading: false, error: err.message });
      });
    return () => controller.abort();
  }, [url, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { ...state, reload, setData: (data) => setState((s) => ({ ...s, data })) };
}
