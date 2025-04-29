
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '1rem',
			screens: {
				'sm': '640px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				company: {
					DEFAULT: 'var(--company-primary, #0f72c1)', 
					light: '#ebf4fd',
					dark: 'var(--company-secondary, #0a4f88)',
					gradient: 'var(--company-gradient, linear-gradient(135deg, #0f72c1, #1e3a8a))'
				},
				support: {
					DEFAULT: '#3b82f6',
					light: '#dbeafe',
					dark: '#2563eb',
					muted: '#bfdbfe'
				},
				globalText: '#222222'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					from: { opacity: '0', transform: 'translateY(15px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-in': {
					from: { transform: 'translateY(20px)', opacity: '0' },
					to: { transform: 'translateY(0)', opacity: '1' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
					'25%': { transform: 'translateY(-12px) rotate(2deg)' },
					'50%': { transform: 'translateY(0) rotate(0deg)' },
					'75%': { transform: 'translateY(-8px) rotate(-2deg)' }
				},
				'pulse-support': {
					'0%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.8)' },
					'40%': { boxShadow: '0 0 0 15px rgba(59, 130, 246, 0)' },
					'80%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)' },
					'100%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)' }
				},
				'gradient-shift': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' }
				},
				'spin-slow': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'bounce-gentle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				},
				'glowing': {
					'0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
					'50%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' },
					'100%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.8s ease-out',
				'slide-in': 'slide-in 0.8s ease-out',
				'float': 'float 5s ease-in-out infinite',
				'pulse-support': 'pulse-support 2.5s infinite',
				'gradient-shift': 'gradient-shift 5s ease infinite',
				'spin-slow': 'spin-slow 18s linear infinite',
				'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
				'glowing': 'glowing 2s ease-in-out infinite'
			},
			fontFamily: {
				sans: ['Tajawal', 'system-ui', 'sans-serif']
			},
			backgroundImage: {
				'gradient-primary': 'linear-gradient(90deg, var(--company-primary, #0f72c1) 0%, var(--company-secondary, #0a4f88) 100%)',
				'gradient-support': 'linear-gradient(135deg, #3b82f6, #1e40af)',
				'gradient-modern': 'linear-gradient(109.6deg, rgba(15, 114, 193, 0.85) 11.2%, rgba(30, 58, 138, 0.95) 91.1%)'
			},
			boxShadow: {
				'soft': '0 4px 15px rgba(0, 0, 0, 0.08)',
				'card': '0 10px 20px -3px rgba(15, 114, 193, 0.15)',
				'glow': '0 0 15px rgba(59, 130, 246, 0.6)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
