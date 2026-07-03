import { ExternalLink } from 'lucide-react';

interface DriveLinkProps {
  href: string | null | undefined;
  label?: string;
  compact?: boolean;
}

export function DriveLink({ href, label = 'Open', compact }: DriveLinkProps) {
  if (!href) {
    return <span className="mx-sub" style={{ color: 'var(--nardo-faint)' }}>—</span>;
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="mx-rowact"
      style={{
        textDecoration: 'none',
        borderColor: 'transparent',
        background: 'transparent',
        color: 'var(--st-info)',
        padding: compact ? '2px 0' : undefined,
      }}
    >
      <ExternalLink size={14} />
      {label}
    </a>
  );
}
