import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        heading: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        headline: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        /* =====================================================================
         * WARM VERTROUWEN KLEURENPALET
         * =====================================================================
         */

        // Primary - Warm Coral (CTA buttons, key actions)
        primary: {
          50: 'var(--primary-50)',   // #FFF5F2
          100: 'var(--primary-100)', // #FFE8E1
          200: 'var(--primary-200)', // #FFD4C8
          300: 'var(--primary-300)', // #FFB59E
          400: 'var(--primary-400)', // #FF9676
          500: 'var(--primary-500)', // #FF7B54 - Main CTA color
          600: 'var(--primary-600)', // #E66A43 - Hover
          700: 'var(--primary-700)', // #CC5A36
        },

        // Coral - Alias for primary (semantic naming)
        coral: {
          25: '#FFFAF8',   // Ultra light - subtle backgrounds
          50: '#FFF5F2',
          100: '#FFE8E1',
          200: '#FFD4C8',
          300: '#FFB59E',
          400: '#FF9676',
          500: '#FF7B54',   // Main CTA color
          600: '#E66A43',   // Hover state
          700: '#CC5A36',
          800: '#A84A2B',   // Dark mode accents
          900: '#8A3B22',   // Darkest variant
          950: '#5C2817',   // Ultra dark for gradients
        },

        // Deep Purple - Headers, secondary actions
        'deep-purple': {
          DEFAULT: 'var(--accent-500)', // #722F37
          light: '#8B4249',
          dark: 'var(--accent-600)',    // #5C262D
        },

        // Royal Purple - VIP elements
        'royal-purple': {
          DEFAULT: 'var(--royal-purple)', // #6B4D8A
          light: '#8B6BA8',
          dark: '#5A3F75',
        },

        // Rose Gold - Luxury accents
        'rose-gold': {
          DEFAULT: 'var(--rose-gold)', // #B76E79
          light: '#D4909A',
          dark: '#9A5A64',
        },

        // Dusty Rose - Secondary accent
        'dusty-rose': {
          DEFAULT: 'var(--dusty-rose)', // #E3867D
          light: '#F0A8A1',
          dark: '#C96B62',
        },

        // Sage Green - Success, growth
        sage: {
          DEFAULT: 'var(--success)', // #A8B5A0
          light: '#C4CFBE',
          dark: '#8A9A82',
        },

        // Charcoal - Primary text (replaces black)
        charcoal: {
          DEFAULT: 'var(--gray-800)', // #2D3142
          light: '#3D4456',
          dark: '#1F2028',
        },

        // Warm neutrals
        cream: 'var(--gray-50)',      // #FFF8F3
        blush: 'var(--gray-100)',     // #F5E6E8

        // Gray scale (warm tinted)
        gray: {
          50: 'var(--gray-50)',
          100: 'var(--gray-100)',
          200: 'var(--gray-200)',
          300: 'var(--gray-300)',
          400: 'var(--gray-400)',
          500: 'var(--gray-500)',
          600: 'var(--gray-600)',
          700: 'var(--gray-700)',
          800: 'var(--gray-800)',
          900: 'var(--gray-900)',
        },

        // Icon system colors
        icon: {
          analysis: 'var(--icon-analysis)',   // #FF7B54
          emotional: 'var(--icon-emotional)', // #E3867D
          strategy: 'var(--icon-strategy)',   // #8B7BA8
          growth: 'var(--icon-growth)',       // #A8B5A0
        },

        // Status colors
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',

        // Shadcn/UI compatible colors
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)', // 6px
        md: 'var(--radius-md)', // 8px
        lg: 'var(--radius-lg)', // 12px
        xl: 'var(--radius-xl)', // 16px
        '2xl': 'var(--radius-2xl)', // 24px
        '3xl': '3rem', // 48px
        full: 'var(--radius-full)', // 9999px (pill shape)
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
} satisfies Config;