import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: 'class',
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {

            colors: {

                /* ── Backgrounds ─────────────────────────────── */
                'bg-base': 'var(--bg-base)',
                'bg-subtle': 'var(--bg-subtle)',
                'bg-muted': 'var(--bg-muted)',
                'bg-card': 'var(--bg-card)',

                /* ── Borders ─────────────────────────────────── */
                'border': 'var(--border)',
                'border-strong': 'var(--border-strong)',

                /* ── Text ────────────────────────────────────── */
                'text-primary': 'var(--text-primary)',
                'text-secondary': 'var(--text-secondary)',
                'text-muted': 'var(--text-muted)',

                /* ── Accent (green) ──────────────────────────── */
                'accent': 'var(--accent)',
                'accent-soft': 'var(--accent-soft)',
                'accent-hover': 'var(--accent-hover)',

                /* ── Semantic ────────────────────────────────── */
                'accent-blue': 'var(--accent-blue)',
                'accent-blue-soft': 'var(--accent-blue-soft)',
                'accent-purple': 'var(--accent-purple)',
                'accent-purple-soft': 'var(--accent-purple-soft)',
                'accent-amber': 'var(--accent-amber)',
                'accent-amber-soft': 'var(--accent-amber-soft)',

                'success': 'var(--success)',
                'success-soft': 'var(--success-soft)',
                'danger': 'var(--danger)',
                'danger-soft': 'var(--danger-soft)',
                'warning': 'var(--warning)',
                'warning-soft': 'var(--warning-soft)',
                'info': 'var(--info)',
                'info-soft': 'var(--info-soft)',

                /* ── Legacy aliases (remove gradually) ──────── */
                'bg-primary': 'var(--bg-base)',
                'bg-secondary': 'var(--bg-subtle)',
                'bg-tertiary': 'var(--bg-muted)',
                'text-tertiary': 'var(--text-muted)',
                'border-color': 'var(--border)',
            },

            fontFamily: {
                sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
                mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
            },

            borderRadius: {
                DEFAULT: '8px',
                sm: '4px',
                md: '8px',
                lg: '12px',
                xl: '16px',
                '2xl': '20px',
            },

            boxShadow: {
                sm: 'var(--shadow-sm)',
                md: 'var(--shadow-md)',
                lg: 'var(--shadow-lg)',
                card: 'var(--shadow-sm)',
            },

            fontSize: {
                xs: ['11px', { lineHeight: '1.5' }],
                sm: ['12px', { lineHeight: '1.5' }],
                base: ['14px', { lineHeight: '1.6' }],
                md: ['15px', { lineHeight: '1.5' }],
                lg: ['18px', { lineHeight: '1.4' }],
                xl: ['22px', { lineHeight: '1.3' }],
                '2xl': ['28px', { lineHeight: '1.2' }],
                '3xl': ['36px', { lineHeight: '1.1' }],
            },

            spacing: {
                '4.5': '18px',
                '13': '52px',
                '18': '72px',
                '22': '88px',
                '26': '104px',
            },

            animation: {
                'fade-in': 'fadeIn 0.3s ease both',
                'slide-up': 'slideUp 0.3s ease both',
                'slide-in': 'slideInBottom 0.4s ease both',
                'skeleton': 'skeleton 1.5s ease infinite',
                'pulse-status': 'statusPulse 2s ease infinite',
                'in': 'slideInBottom 0.4s ease both',
            },

            keyframes: {
                fadeIn: {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                slideUp: {
                    from: { opacity: '0', transform: 'translateY(16px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                slideInBottom: {
                    from: { opacity: '0', transform: 'translateY(8px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                skeleton: {
                    '0%': { backgroundPosition: '200% 0' },
                    '100%': { backgroundPosition: '-200% 0' },
                },
                statusPulse: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.4' },
                },
            },

            transitionTimingFunction: {
                DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
            },
        },
    },
    plugins: [],
};

export default config;
