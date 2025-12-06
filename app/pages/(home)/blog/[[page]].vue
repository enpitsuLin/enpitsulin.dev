<script setup lang="ts">
import type { UsePaginationProps } from '@ark-ui/vue/pagination'
import { normalizePage } from '#shared/utils/normalize-page'
import { Pagination, usePagination } from '@ark-ui/vue/pagination'

definePageMeta({
  loaders: [usePostsData],
  alias: '/blog/:page(\\d+)?',
  layout: 'home',
})

const route = useRoute('blog-page')

const posts = await usePostsData()

const paginationOptions = computed<UsePaginationProps>(() => ({
  onPageChange(details) {
    navigateTo({
      name: 'blog-page',
      params: {
        page: details.page === 1 ? undefined : details.page,
      },
    })
  },
  count: posts.total,
  pageSize: posts.limit,
  page: normalizePage(route.params.page),
  siblingCount: 2,
}))

const pagination = usePagination(paginationOptions)
</script>

<template>
  <HomePageContainer
    title="全部文章"
    description="一般写博客文章是随心所欲的，想到什么就有可能会写一些，会希望能够把好用的技术知识传递给更多的人。喜欢围绕着技术为主的话题，但是也会写一些非技术的奇奇怪怪的话题。"
  >
    <div v-if="posts && posts?.data?.length > 0" pl="md:6" border="md:l border" w-full>
      <ul flex="~ col gap-16" pb-16>
        <li v-for="(article, index) in posts?.data" :key="article.slug">
          <Article :article="article" :delay="index * 0.1" />
        </li>
      </ul>
    </div>
    <ListEmpty v-else type="posts" />

    <Pagination.RootProvider flex="~ row items-center justify-between gap-1" w-full pt-4 :value="pagination">
      <Pagination.PrevTrigger
        flex="inline items-center justify-center" un-text="sm"
        border="focus-visible:accent/50 rounded-md" ring="focus-visible:accent/50 focus-visible:3px"
        bg="hover:zinc-200/70 dark:hover:zinc-800/70" p="y2 x2.5" h-9 whitespace-nowrap font-medium outline-none
        class="transition-all disabled:pointer-events-none disabled:cursor-not-allowed disabled:op-50"
      >
        上一页
      </Pagination.PrevTrigger>
      <div flex="~ row items-center gap-1">
        <Pagination.Context v-slot="pagination">
          <template v-for="(page, index) in pagination.pages">
            <Pagination.Item
              v-if="page.type === 'page'" :key="index" :value="page.value" :type="page.type"
              flex="inline items-center justify-center" un-text="sm"
              border="data-[selected]:~ data-[selected]:border focus-visible:accent/50 rounded-md"
              ring="focus-visible:accent/50 focus-visible:3px" bg="hover:zinc-200/70 dark:hover:zinc-800/70" p="y2 x2.5"
              size-9 whitespace-nowrap font-medium outline-none
              class="transition-all disabled:pointer-events-none disabled:cursor-not-allowed disabled:op-50 data-[selected]:shadow-md"
            >
              {{ page.value }}
            </Pagination.Item>
            <Pagination.Ellipsis v-else :key="`e${index}`" flex="~ items-center justify-center" size-9 :index="index">
              &#8230;
              <span class="sr-only">更多页面</span>
            </Pagination.Ellipsis>
          </template>
        </Pagination.Context>
      </div>
      <Pagination.NextTrigger
        flex="inline items-center justify-center" un-text="sm"
        border="focus-visible:accent/50 rounded-md" ring="focus-visible:accent/50 focus-visible:3px"
        bg="hover:zinc-200/70 dark:hover:zinc-800/70" p="y2 x2.5" h-9 whitespace-nowrap font-medium outline-none
        class="transition-all disabled:pointer-events-none disabled:cursor-not-allowed disabled:op-50"
      >
        下一页
      </Pagination.NextTrigger>
    </Pagination.RootProvider>
  </HomePageContainer>
</template>

<style>
.loader {
  width: 48px;
  height: 48px;
  display: inline-block;
  position: relative;
}

.loader::after,
.loader::before {
  content: '';
  box-sizing: border-box;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  left: 0;
  top: 0;
  animation: animloader 2s linear infinite;
}

.loader::after {
  animation-delay: 1s;
}

@keyframes animloader {
  0% {
    transform: scale(0);
    opacity: 1;
  }

  100% {
    transform: scale(1);
    opacity: 0;
  }
}
</style>
