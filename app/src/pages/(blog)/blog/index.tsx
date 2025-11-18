import { Markdown } from '@/components/article/markdown'
import '@/styles/shiki.css'

export default function BlogPage() {
  return (
    <div>
      <h1>Blog</h1>
      <Markdown>
        {`# heading 1

# heading 2

> qoute
 
 
\`\`\`js
const let foo = 'bar'

console.log('Hello world')
\`\`\`
`}
      </Markdown>
    </div>
  )
}
