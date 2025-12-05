<script lang="ts">
import { defineColadaLoader } from 'unplugin-vue-router/data-loaders/pinia-colada'

function normalizPage(page: string | number | undefined) {
  return page ? Number.parseInt(page as string) : 1
}

export const usePostsData = defineColadaLoader('blog-tag-tag-page', {
  key: to => ['posts', to.params.tag, normalizPage(to.params.page)],
  async query(to, { signal }) {
    return $fetch(`/api/post/tag/${to.params.tag}`, { signal })
  },
  staleTime: 10 * 1000,
})
</script>

<script setup lang="ts">
import type { UsePaginationProps } from '@ark-ui/vue/pagination'
import { Pagination, usePagination } from '@ark-ui/vue/pagination'

definePageMeta({
  alias: '/blog/tag/:tag/:page(\\d+)?',
  layout: 'home',
  __loaders: [usePostsData],
})

const route = useRoute('blog-tag-tag-page')
const router = useRouter()

const POSTS_LIMIT = 5
const page = computed<number>(() => route.params.page ? Number.parseInt(route.params.page as string) : 1)

const posts = await usePostsData()

const paginationOptions = computed<UsePaginationProps>(() => ({
  onPageChange(details) {
    router.push({
      name: 'blog-page',
      params: {
        page: details.page === 1 ? undefined : details.page,
      },
    })
  },
  count: posts ? posts.total : 0,
  pageSize: posts?.limit ?? POSTS_LIMIT,
  page: page.value,
  siblingCount: 2,
}))

const pagination = usePagination(paginationOptions)
</script>

<template>
  <HomePageContainer
    :title="`标签: ${route.params.tag}`"
    :description="`关于标签: ${route.params.tag} 的文章`"
  >
    <div v-if="posts && posts?.data?.length > 0 " pl="md:6" border="md:l border" w-full>
      <ul flex="~ col gap-16" pb-16>
        <li v-for="(article, index) in posts?.data" :key="article.slug">
          <Article :article="article" :delay="index * 0.1" />
        </li>
      </ul>
    </div>
    <div v-else>
      No Posts
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
