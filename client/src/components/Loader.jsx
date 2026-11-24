export function Spinner({ className = 'h-6 w-6', light = false }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-[3px] ${light ? 'border-white/40 border-t-white' : 'border-primary/20 border-t-primary'} ${className}`}
      role="status"
      aria-label="Loading…"
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner className="h-10 w-10" />
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white p-4">
      <div className="skeleton mx-auto aspect-square w-full rounded" />
      <div className="skeleton mt-4 h-3 w-4/5 rounded" />
      <div className="skeleton mt-2 h-3 w-2/5 rounded" />
      <div className="skeleton mt-3 h-4 w-3/5 rounded" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-px bg-gray-100 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  );
}
