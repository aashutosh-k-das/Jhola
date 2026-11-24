import { useState } from 'react';
import { BagIcon } from './Logo';

/** Native lazy-loaded image with shimmer placeholder and graceful fallback. */
export default function LazyImage({ src, alt = '', className = '', imgClassName = '', eager = false, ...rest }) {
  const [state, setState] = useState({ src, loaded: false, failed: false });
  if (state.src !== src) setState({ src, loaded: false, failed: false });

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!state.loaded && !state.failed && <div className="skeleton absolute inset-0 rounded" />}
      {state.failed || !src ? (
        <div className="flex h-full w-full items-center justify-center bg-page">
          <BagIcon className="h-1/3 w-1/3 opacity-30" bag="#9ca3af" handle="#9ca3af" smile="#f1f3f6" />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setState((s) => ({ ...s, loaded: true }))}
          onError={() => setState((s) => ({ ...s, failed: true }))}
          className={`h-full w-full object-contain transition duration-300 ${state.loaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
          {...rest}
        />
      )}
    </div>
  );
}
