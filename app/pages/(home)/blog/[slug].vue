<script setup lang="ts">
defineOptions({
  name: 'BlogSlug',
})

definePageMeta({
  loaders: [usePostData, useSurroundPostData],
  layout: 'home',
})

const data = await usePostData()

const surroundData = await useSurroundPostData()

useHead({
  title: computed(() => data?.title),
})

if (!data) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Post not found',
  })
}
</script>

<template>
  <div v-if="data" mt-16 text-14px flex="~ justify-between">
    <div text="1.1em" class="w-full md:w-80%" pb-20 pr="0 md:7.5" border="md:r border">
      <header
        pb-10 space-y-10 bg="gradient-to-r [position:bottom] [size:10px_1px] repeat-x"
        class="from-border to-transparent"
      >
        <section flex="~ items-center wrap gap-2" text-sm op-80>
          <div flex="~ items-center gap-2">
            <span class="sr-only">发布时间</span>
            <i inline-block class="i-mingcute:calendar-fill" />
            <NuxtTime :datetime="data.publishedAt" />
          </div>
          <div v-if="data.data.estimation.minutes" flex="~ items-center gap-2">
            <span class="sr-only">阅读时间</span>
            <i inline-block class="i-mingcute:time-fill" />
            <span>约 {{ Math.ceil(data.data.estimation.minutes) }} 分钟</span>
          </div>
        </section>
        <h1 text-4xl font-semibold>
          {{ data.title }}
        </h1>
        <section>
          <ul flex="~ wrap items-center gap-2" tracking-tight>
            <li v-for="tag in data.tags ?? []" :key="tag">
              <ArticleTag :tag="tag" />
            </li>
          </ul>
        </section>
      </header>
      <MDCRenderer
        :body="data.body"
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
        <TocLinks :links="data?.toc?.links" />
      </nav>
    </aside>
  </div>
  <footer mx="-8 sm:-12" px="8 sm:12" border="t border">
    <nav flex="~ justify-between" my-20px>
      <RouterLink
        v-if="surroundData?.next"
        flex="~ col items-start" space-y-5px max-w="1/2"
        :to="{ name: 'blog-slug', params: { slug: surroundData.next.slug } }"
      >
        <p op-50>
          下一篇
        </p>
        <p>{{ surroundData.next.title }}</p>
      </RouterLink>
      <div v-else aria-hidden="true" />
      <RouterLink
        v-if="surroundData?.previous"
        flex="~ col items-end" space-y-5px max-w="1/2"
        :to="{ name: 'blog-slug', params: { slug: surroundData.previous.slug } }"
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
