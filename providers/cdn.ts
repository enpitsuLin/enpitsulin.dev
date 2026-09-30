import type { FontFaceData, FontStyles } from 'unifont'
import { defineFontProvider } from 'unifont'

// Pin jsDelivr sources so builds do not depend on the upstream repository's HEAD.
const harmonyOSBaseURL = 'https://cdn.jsdelivr.net/gh/IKKI2000/harmonyos-fonts@620f0e29dbaf9c8387b71ef34eb20dfb8b0fcb6b/fonts/HarmonyOS_Sans_SC'

const fontMapping: Record<string, Array<FontFaceData & { weight: number, style: FontStyles }>> = {
  'HarmonyOS Sans SC': [
    {
      weight: 400,
      style: 'normal',
      src: [{ url: `${harmonyOSBaseURL}/HarmonyOS_Sans_SC_Regular.woff2`, format: 'woff2' }],
    },
    {
      weight: 500,
      style: 'normal',
      src: [{ url: `${harmonyOSBaseURL}/HarmonyOS_Sans_SC_Medium.woff2`, format: 'woff2' }],
    },
    {
      weight: 700,
      style: 'normal',
      src: [{ url: `${harmonyOSBaseURL}/HarmonyOS_Sans_SC_Bold.woff2`, format: 'woff2' }],
    },
  ],
}

export default defineFontProvider('cdn', () => ({
  resolveFont(family, options) {
    const faces = fontMapping[family]
    if (!faces)
      return

    const fonts = faces.filter(face =>
      options.weights.includes(String(face.weight)) && options.styles.includes(face.style),
    )
    if (fonts.length)
      return { fonts }
  },
}))
