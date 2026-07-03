export function LoadingSpinner({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-20 gap-3 text-nardo-muted text-sm">
      <svg
        className="animate-spin"
        width={18} height={18}
        viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2}
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      {message}
    </div>
  );
}
