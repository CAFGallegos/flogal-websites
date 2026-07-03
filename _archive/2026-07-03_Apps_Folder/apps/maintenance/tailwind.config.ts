import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Nardo Grey surface scale
        'nardo-bg':     '#d2d4d3',
        'nardo-bg2':    '#c6c9c8',
        'nardo-card':   '#f2f2f0',
        'nardo-elev':   '#ffffff',
        'nardo-border': '#b5bab9',
        'nardo-border-soft': '#c2c6c5',
        'nardo-ink':    '#1f2326',
        'nardo-muted':  '#666d70',
        'nardo-faint':  '#8b9192',
        // Charcoal chrome
        'char-0': '#191c1e',
        'char-1': '#212528',
        'char-2': '#282d30',
        'char-3': '#323739',
        'char-fg':       '#e9eaea',
        'char-fg-dim':   '#9aa0a1',
        'char-fg-faint': '#6b7173',
        // Status
        'st-ready':      '#2f7d56',
        'st-ready-bg':   '#e2ece6',
        'st-down':       '#a23b25',
        'st-down-bg':    '#efe1dd',
        'st-wait':       '#9a7415',
        'st-wait-bg':    '#efe7d3',
        'st-neutral':    '#5c6568',
        'st-neutral-bg': '#e4e6e5',
        'st-limited':    '#3f6066',
        'st-limited-bg': '#e0e8ea',
        'st-info':       '#2a4f7a',
        'st-info-bg':    '#e0e7ef',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'Menlo', 'monospace'],
      },
      borderRadius: {
        pill: '999px',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.2,0.6,0.2,1)',
      },
      transitionDuration: {
        fast: '120ms',
        base: '200ms',
      },
    },
  },
  plugins: [],
};

export default config;
