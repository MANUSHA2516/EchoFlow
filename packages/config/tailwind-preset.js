/** Minimal Tailwind preset — apps own most styling to match mockups faithfully. */
module.exports = {
  theme: {
    extend: {
      colors: {
        echo: {
          teal: '#0D9488',
          'teal-dark': '#0F766E',
          cyan: '#06B6D4',
          navy: '#0F172A',
          slate: '#64748B',
          amber: '#F59E0B',
          green: '#10B981',
          urgent: '#DC2626',
          surface: '#F8FAFC',
          border: '#E2E8F0',
        },
      },
      borderRadius: {
        echo: '1rem',
        'echo-lg': '1.25rem',
      },
      boxShadow: {
        echo: '0 8px 30px rgba(15, 23, 42, 0.08)',
      },
    },
  },
};
