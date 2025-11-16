import { toJsxRuntime } from 'hast-util-to-jsx-runtime'
import { Fragment, jsx, jsxs } from 'react/jsx-runtime'
import { VFile } from 'vfile'
import { ProseDetails, ProsePre, ProseSummary } from '@/components/article/prose'
import { getProcessor } from '@/lib/markdown/processor'

export async function Markdown({ children }: { children: string }) {
  const file = new VFile(children)
  const processor = await getProcessor()

  const mdast = processor.parse(file)

  const hast = await processor.run(mdast, file)

  const node = toJsxRuntime(hast, {
    Fragment,
    jsx,
    jsxs,
    passNode: true,
    ignoreInvalidStyle: true,
    components: {
      pre: ProsePre,
      details: ProseDetails,
      summary: ProseSummary,
    },
  })

  return (
    <article
      className="prose dark:prose-invert"
    >
      {node}
    </article>
  )
}
