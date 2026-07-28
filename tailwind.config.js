/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--paper))',
  			foreground: 'hsl(var(--ink))',
  			paper: {
  				DEFAULT: 'hsl(var(--paper))',
  				deep: 'hsl(var(--paper-deep))',
  				shadow: 'hsl(var(--paper-shadow))'
  			},
  			ink: {
  				DEFAULT: 'hsl(var(--ink))',
  				soft: 'hsl(var(--ink-soft))'
  			},
  			burgundy: 'hsl(var(--burgundy))',
  			cyanotype: 'hsl(var(--cyanotype))',
  			'dusty-yellow': 'hsl(var(--dusty-yellow))',
  			forest: 'hsl(var(--forest))',
  			'faded-red': 'hsl(var(--faded-red))',
  			archive: {
  				bg: 'hsl(var(--archive-bg))',
				bg2: 'hsl(var(--archive-bg-2))',
  				fg: 'hsl(var(--archive-fg))',
  				muted: 'hsl(var(--archive-muted))',
  				line: 'hsl(var(--archive-line))'
  			},
  			tape: 'hsl(var(--tape))',
  			card: {
  				DEFAULT: 'hsl(var(--paper))',
  				foreground: 'hsl(var(--ink))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--paper-deep))',
  				foreground: 'hsl(var(--ink-soft))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--burgundy))',
  				foreground: 'hsl(var(--paper))'
  			},
  			border: 'hsl(var(--ink) / 0.14)',
  			input: 'hsl(var(--ink) / 0.14)',
  			ring: 'hsl(var(--cyanotype))',
  			chart: {
  				'1': 'hsl(var(--burgundy))',
  				'2': 'hsl(var(--cyanotype))',
  				'3': 'hsl(var(--forest))',
  				'4': 'hsl(var(--dusty-yellow))',
  				'5': 'hsl(var(--faded-red))'
  			}
  		},
  		fontFamily: {
  			heading: ['var(--font-heading)'],
  			body: ['var(--font-body)'],
  			display: ['var(--font-display)'],
  			mono: ['var(--font-mono)'],
			ui: ['var(--font-ui)'],
			hand: ['var(--font-hand)']
  		},
  		keyframes: {
  			'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
  			'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
  			'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
  			'rise-in': { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
  			'receipt-print': { from: { transform: 'translateY(-8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } }
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in': 'fade-in 0.5s ease-out both',
  			'rise-in': 'rise-in 0.6s ease-out both',
  			'receipt-print': 'receipt-print 0.25s ease-out both'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
