import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'bg-primary': 'var(--bg-primary)',
                'bg-secondary': 'var(--bg-secondary)',
                'bg-tertiary': 'var(--bg-tertiary)',
                'accent-primary': 'var(--accent-primary)',
                'accent-secondary': 'var(--accent-secondary)',
                'accent-tertiary': 'var(--accent-tertiary)',
                'text-primary': 'var(--text-primary)',
                'text-secondary': 'var(--text-secondary)',
                'text-tertiary': 'var(--text-tertiary)',
                'success': 'var(--success)',
                'warning': 'var(--warning)',
                'error': 'var(--error)',
                'info': 'var(--info)',
            },
            fontFamily: {
                sans: ['"Geist Sans"', 'system-ui', 'sans-serif'],
                mono: ['"Geist Mono"', 'monospace'],
            },
        },
    },
    plugins: [],
};
export default config;
