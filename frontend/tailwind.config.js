/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      /**
       * Paleta Cinema Noir — a identidade visual do site.
       * paper: off-white quente (fundo claro)
       * ink: quase-preto quente (texto / fundo escuro)
       * amber: dourado (acento)
       */
      colors: {
        paper: {
          DEFAULT: '#f4f0ea',
          2: '#eae4da',
        },
        ink: {
          DEFAULT: '#16130f',
          soft: '#5c554c',
          deep: '#0a0807',
        },
        amber: {
          DEFAULT: '#b8860b',
          deep: '#9a6f08',
          light: '#d4a02a',
        },
      },
      fontFamily: {
        // Display serif (títulos) e sans (corpo)
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.28em',
      },
      keyframes: {
        photoIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        blink: {
          '0%, 55%': { opacity: '1' },
          '70%, 100%': { opacity: '0.15' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        photoIn: 'photoIn 1.6s 0.3s forwards',
        blink: 'blink 1.6s infinite',
        fadeUp: 'fadeUp 0.8s ease forwards',
      },
    },
  },
  plugins: [],
};
