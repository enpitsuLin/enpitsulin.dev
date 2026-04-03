<script setup lang="ts">
import { visit } from '@nuxt/content/runtime'
import { estimate } from 'lesetid'

defineOptions({
  name: 'BlogSlug',
})

defineRouteRules({ prerender: true })

definePageMeta({
  layout: 'home',
})

const route = useRoute()

const { data: page } = await useAsyncData(route.path, () =>
  queryCollection('blog').path(route.path).first())

if (!page.value)
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
const { data: surround } = await useAsyncData(`${route.path}-surround`, () =>
  queryCollectionItemSurroundings(
    'blog',
    route.path,
    { fields: ['description'] },
  ).order('publishedAt', 'DESC'))

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

defineOgImage('BlogPost', { title })

useSeoMeta({
  title,
  description,
  ogDescription: description,
  ogTitle: title,
})

const surroundData = computed(() => ({
  previous: surround.value?.at(1) ?? null,
  next: surround.value?.at(0) ?? null,
}))

const estimation = computed(() => {
  if (!page.value?.body)
    return { minutes: 0 }

  let text = ''
  visit(
    page.value?.body,
    (node) => {
      if (Array.isArray(node)) {
        return false
      }
      return true
    },
    (node) => {
      if (Array.isArray(node))
        return node
      text += node

      return node
    },
  )

  const estimation = estimate(text)

  return { minutes: estimation.minutes }
})
</script>

<template>
  <div v-if="page" mt-16 text-14px flex="~ justify-between">
    <div text="1.1em" class="w-full md:w-80%" pb-20 pr="0 md:7.5" border="md:r border">
      <header
        pb-6 space-y-10 bg="gradient-to-r [position:bottom] [size:10px_1px] repeat-x"
        class="from-border to-transparent"
      >
        <section flex="~ items-center wrap gap-2" text-sm op-80>
          <div flex="~ items-center gap-2">
            <span class="sr-only">发布时间</span>
            <i inline-block class="i-mingcute:calendar-fill" />
            <NuxtTime :datetime="page.publishedAt" />
          </div>
          <div v-if="estimation.minutes" flex="~ items-center gap-2">
            <span class="sr-only">阅读时间</span>
            <i inline-block class="i-mingcute:time-fill" />
            <span>约 {{ Math.ceil(estimation.minutes) }} 分钟</span>
          </div>
        </section>
        <h1 text-4xl font-semibold>
          {{ page.title }}
        </h1>
        <section v-if="page.tags.length">
          <ul flex="~ wrap items-center gap-2" tracking-tight>
            <li v-for="tag in page.tags" :key="tag">
              <ArticleTag :tag="tag" />
            </li>
          </ul>
        </section>
      </header>
      <ContentRenderer
        :value="page.body"
        tag="article"
        text-15px
        class="max-w-unset prose dark:prose-invert"
      />
    </div>
    <aside sticky top-80px ml-4 w="20%" h-full pb-20 class="hidden md:block">
      <h2 class="m-[20px_0_10px]">
        目录
      </h2>
      <nav pl-4>
        <TocLinks :links="page.body.toc?.links" />
      </nav>
    </aside>
  </div>
  <footer mx="-8 sm:-12" px="8 sm:12" border="t border">
    <nav flex="~ justify-between" my-20px>
      <RouterLink
        v-if="surroundData.next"
        flex="~ col items-start" space-y-5px max-w="1/2"
        :to="surroundData.next.path"
      >
        <p op-50>
          下一篇
        </p>
        <p>{{ surroundData.next.title }}</p>
      </RouterLink>
      <div v-else aria-hidden="true" />
      <RouterLink
        v-if="surroundData.previous"
        flex="~ col items-end" space-y-5px max-w="1/2"
        :to="surroundData.previous.path"
      >
        <p op-50>
          上一篇
        </p>
        <p>{{ surroundData.previous.title }}</p>
      </RouterLink>
      <div v-else aria-hidden="true" />
    </nav>
  </footer>
</template>
