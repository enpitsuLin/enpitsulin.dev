import type { Theme } from '@unocss/preset-uno'
import { handler } from '@unocss/preset-mini/utils'
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWebFonts,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

function handleMatchNumber(v: string, defaultVal = '0') {
  return handler.bracket.cssvar.global.auto.fraction.number(v || defaultVal)?.toString().replace('%', '')
}
const handleMatchRem = (v: string, defaultVal = 'full') => handler.bracket.cssvar.global.auto.fraction.rem(v || defaultVal)

export default defineConfig<Theme>({
  theme: {
    colors: {
      background: 'hsl(var(--theme-background))',
      accent: 'hsl(var(--theme-accent))',
      border: 'hsl(var(--theme-border))',
    },
    animation: {
      keyframes: {
        'marquee': `{from {transform:translateX(0)} to{transform:translateX(calc(-100% - var(--gap)))}}`,
        'marquee-vertical': `{from {transform:translateY(0)} to{transform:translateY(calc(-100% - var(--gap)))}}`,
      },
      durations: {
        'marquee': 'var(--duration)',
        'marquee-vertical': 'var(--duration)',
      },
      counts: {
        'marquee': 'infinite',
        'marquee-vertical': 'infinite',
      },
    },
  },
  rules: [
    [
      'animate-in',
      { animation: 'animate-enter .2s ease-out' },
    ],
    [
      'animate-out',
      { animation: 'animate-exit .2s ease-out' },
    ],
    [/^fade-in-?(.+)?$/, ([, d]) => ({ '--un-enter-opacity': `${Number(handleMatchNumber(d) || 0) / 100}` })],
    [/^fade-out-?(.+)?$/, ([, d]) => ({ '--un-exit-opacity': `${Number(handleMatchNumber(d) || 0) / 100}` })],
    [/^zoom-in-?(.+)?$/, ([, d]) => ({ '--un-enter-scale': `${Number(handleMatchNumber(d) || 0) / 100}` })],
    [/^zoom-out-?(.+)?$/, ([, d]) => ({ '--un-exit-scale': `${Number(handleMatchNumber(d) || 0) / 100}` })],
    [/^spin-in-?(.+)?$/, ([, d]) => ({ '--un-enter-rotate': `${Number(handleMatchNumber(d) || 0)}deg` })],
    [/^spin-out-?(.+)?$/, ([, d]) => ({ '--un-exit-rotate': `${Number(handleMatchNumber(d) || 0)}deg` })],
    [/^slide-in-from-top-?(.+)?$/, ([, d]) => ({ '--un-enter-translate-y': `-${handleMatchRem(d)}` })],
    [/^slide-in-from-bottom-?(.+)?$/, ([, d]) => ({ '--un-enter-translate-y': handleMatchRem(d) })],
    [/^slide-in-from-left-?(.+)?$/, ([, d]) => ({ '--un-enter-translate-x': `-${handleMatchRem(d)}` })],
    [/^slide-in-from-right-?(.+)?$/, ([, d]) => ({ '--un-enter-translate-x': handleMatchRem(d) })],
    [/^slide-out-to-top-?(.+)?$/, ([, d]) => ({ '--un-exit-translate-y': `-${handleMatchRem(d)}` })],
    [/^slide-out-to-bottom-?(.+)?$/, ([, d]) => ({ '--un-exit-translate-y': handleMatchRem(d) })],
    [/^slide-out-to-left-?(.+)?$/, ([, d]) => ({ '--un-exit-translate-x': `-${handleMatchRem(d)}` })],
    [/^slide-out-to-right-?(.+)?$/, ([, d]) => ({ '--un-exit-translate-x': handleMatchRem(d) })],
  ],
  presets: [
    presetWind3(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      autoInstall: true,
    }),
    presetTypography({
      cssExtend: {
        'pre': {
          padding: '0',
        },
        ':not(pre) > code::before,:not(pre) > code::after': {
          content: 'normal',
        },
        'table': {
          'display': 'table',
          'table-layout': 'auto',
          'margin-bottom': '2em',
          'font-size': '.865rem',
          'line-height': '1.25rem',
          'text-align': 'left',
          'width': '100%',
        },
        'td,th': {
          border: 'unset',
        },
        'thead tr': {
          'border-bottom-width': '1px',
          'border-bottom-color': 'hsl(var(--theme-border) / 0.5)',
        },
        'tbody tr:not(:last-child),tbody tr:first-child:last-child': {
          'border-bottom-color': 'hsl(var(--theme-border))',
          'border-bottom-width': '1px',
        },
        'li': {
          'margin': '1em 0',
          'line-height': '1.75',
        },
      },
    }),
    presetWebFonts({
      fonts: {
        sans: {
          name: 'Inter',
          weights: ['400', '500', '700'],
        },
        mono: {
          provider: 'none',
          name: 'MonaspiceArNerdFont',
        },
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
