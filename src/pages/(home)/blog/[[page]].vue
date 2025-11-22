<script setup lang="ts">
import { Pagination, usePagination } from '@ark-ui/vue/pagination'

import { useQuery } from '@pinia/colada'

definePage({
  alias: '/blog/:page(\\d+)?',
})

const $hc = useHC()

const router = useRouter()
const route = useRoute('/(home)/blog/[[page]]')

const pageLimit = 5
const page = computed<number>(() => route.params.page ? Number.parseInt(route.params.page as string) : 0)

const { data: posts } = useQuery({
  key: () => ['posts', page.value],
  async query() {
    const offset = (Math.max(1, page.value) - 1) * pageLimit
    const res = await $hc.api.post.$get({
      query: {
        limit: pageLimit.toString(),
        offset: offset.toString(),
      },
    })
    return res.json()
  },
  placeholderData(previousData) {
    return previousData
  },
})

const pagination = usePagination(computed(() => ({
  onPageChange(details) {
    router.push({
      name: '/(home)/blog/[[page]]',
      params: {
        page: details.page === 1 ? undefined : details.page,
      },
    })
  },
  count: posts.value ? posts.value.total - 1 : 0,
  pageSize: posts.value?.limit ?? pageLimit,
  currentPage: page.value,
  siblingCount: 2,
})))
</script>

<template>
  <div v-if="posts && posts?.data?.length > 0 " pl="md:6" border="md:l border" w-full>
    <ul flex="~ col gap-16" pb-16>
      <li v-for="(article, index) in posts?.data" :key="article.id">
        <Article :article="article" :delay="index * 0.1" />
      </li>
    </ul>
  </div>

  <Pagination.RootProvider
    flex="~ row items-center justify-between gap-1"
    w-full pt-4
    :value="pagination"
  >
    <Pagination.PrevTrigger
      flex="inline items-center justify-center"
      un-text="sm"
      border="focus-visible:accent/50 rounded-md"
      ring="focus-visible:accent/50 focus-visible:3px"
      bg="hover:zinc-200/70 dark:hover:zinc-800/70"
      p="y2 x2.5"
      h-9 whitespace-nowrap font-medium outline-none
      class="transition-all disabled:pointer-events-none disabled:cursor-not-allowed disabled:op-50"
    >
      上一页
    </Pagination.PrevTrigger>
    <div flex="~ row items-center gap-1">
      <Pagination.Context v-slot="pagination">
        <template v-for="(page, index) in pagination.pages">
          <Pagination.Item
            v-if="page.type === 'page'"
            :key="index"
            :value="page.value"
            :type="page.type"
            flex="inline items-center justify-center"
            un-text="sm"
            border="data-[selected]:~ data-[selected]:border focus-visible:accent/50 rounded-md"
            ring="focus-visible:accent/50 focus-visible:3px"
            bg="hover:zinc-200/70 dark:hover:zinc-800/70"
            p="y2 x2.5"
            size-9 whitespace-nowrap font-medium outline-none
            class="transition-all disabled:pointer-events-none disabled:cursor-not-allowed disabled:op-50 data-[selected]:shadow-md"
          >
            {{ page.value }}
          </Pagination.Item>
          <Pagination.Ellipsis
            v-else
            :key="`e${index}`"
            flex="~ items-center justify-center"
            size-9
            :index="index"
          >
            &#8230;
            <span class="sr-only">更多页面</span>
          </Pagination.Ellipsis>
        </template>
      </Pagination.Context>
    </div>
    <Pagination.NextTrigger
      flex="inline items-center justify-center"
      un-text="sm"
      border="focus-visible:accent/50 rounded-md"
      ring="focus-visible:accent/50 focus-visible:3px"
      bg="hover:zinc-200/70 dark:hover:zinc-800/70"
      p="y2 x2.5"
      h-9 whitespace-nowrap font-medium outline-none
      class="transition-all disabled:pointer-events-none disabled:cursor-not-allowed disabled:op-50"
    >
      下一页
    </Pagination.NextTrigger>
  </Pagination.RootProvider>
</template>
