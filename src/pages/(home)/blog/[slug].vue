<script setup lang="ts">
import { useQuery } from '@pinia/colada'

const route = useRoute('/(home)/blog/[slug]')
const $hc = useHC()

const { data } = useQuery({
  key: () => ['post', route.params.slug],
  async query() {
    const res = await $hc.api.post.slug[':slug'].$get({
      param: { slug: route.params.slug },
    })
    return res.json()
  },
})

const { data: surroundData } = useQuery({
  key: () => ['post', route.params.slug, 'surround'],
  async query() {
    const res = await $hc.api.post.slug[':slug'].surround.$get({
      param: { slug: route.params.slug },
    })
    return res.json()
  },
})

const formatDate = useDateFormat(
  () => data.value?.publishedAt,
  'YYYY MMM DD dddd',
  {
    locales: 'zh-Hans',
  },
)

useHead({
  title: computed(() => data.value?.title ?? ''),
})
</script>

<template>
  <div mt-16 text-14px flex="~ justify-between">
    <div text="1.1em" class="w-full md:w-80%" pb-20 pr="0 md:7.5" border="md:r border">
      <header
        pb-10 space-y-10 bg="gradient-to-r [position:bottom] [size:10px_1px] repeat-x"
        class="from-border to-transparent"
      >
        <section flex="~ items-center wrap gap-2" text-sm op-80>
          <div flex="~ items-center gap-2">
            <span class="sr-only">发布时间</span>
            <i inline-block class="i-mingcute:calendar-fill" />
            <time :datetime="data?.publishedAt">{{ formatDate }}</time>
          </div>
          <!-- <div v-if="data?.meta.readingTime.minutes" flex="~ items-center gap-2">
            <span class="sr-only">阅读时间</span>
            <i inline-block class="i-mingcute:time-fill" />
            <span>约 {{ Math.ceil(data?.meta.readingTime.minutes) }} 分钟</span>
          </div> -->
        </section>
        <h1 text-4xl font-semibold>
          {{ data?.title }}
        </h1>
        <section>
          <ul flex="~ wrap items-center gap-2" tracking-tight>
            <li v-for="tag in data?.tags ?? []" :key="tag">
              <ArticleTag :tag="tag" />
            </li>
          </ul>
        </section>
      </header>
      <MarkdownRender
        v-if="data?.content"
        :content="data.content"
        :query-key="route.params.slug"
        tag="article"
        text-15px
        class="max-w-unset prose dark:prose-invert"
      />
    </div>
    <aside sticky top-80px ml-4 w="20%" h-full pb-20 class="hidden md:block">
      <h2 class="m-[20px_0_10px]">
        Table of content
      </h2>
      <nav pl-4>
        <!-- <TocLinks :links="data?.body?.toc?.links" /> -->
      </nav>
    </aside>
  </div>
  <footer mx="-8 sm:-12" px="8 sm:12" border="t border">
    <nav flex="~ justify-between" my-20px>
      <RouterLink
        v-if="surroundData?.next"
        flex="~ col items-start" space-y-5px max-w="1/2"
        :to="{ name: '/(home)/blog/[slug]', params: { slug: surroundData.next.slug } }"
      >
        <p op-50>
          Next
        </p>
        <p>{{ surroundData.next.title }}</p>
      </RouterLink>
      <div v-else aria-hidden="true" />
      <RouterLink
        v-if="surroundData?.previous"
        flex="~ col items-end" space-y-5px max-w="1/2"
        :to="{ name: '/(home)/blog/[slug]', params: { slug: surroundData.previous.slug } }"
      >
        <p op-50>
          Previous
        </p>
        <p>{{ surroundData.previous.title }}</p>
      </RouterLink>
      <div v-else aria-hidden="true" />
    </nav>
  </footer>
</template>
