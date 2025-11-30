<script setup lang="ts">
import { useInfiniteQuery } from '@pinia/colada'

const POSTS_LIMIT = 10

const initialPosts = await $fetch('/api/post', { query: { limit: POSTS_LIMIT, offset: 0 } })

const { state: postsData, loadMore, asyncStatus } = useInfiniteQuery({
  key: ['posts'],
  query: async ({ offset, limit }) => {
    const response = await $fetch('/api/post', { query: { limit, offset: offset + limit } })
    return response
  },
  initialPage: initialPosts,
  merge(pages, newPosts) {
    return {
      data: [...pages.data, ...newPosts.data],
      offset: newPosts.offset,
      limit: newPosts.limit,
      total: newPosts.total,
    }
  },
})

const allPosts = computed(() => postsData.value.data.data)

const isReachEnd = computed(() => {
  if (postsData.value && postsData.value.data)
    return (postsData.value.data.offset + POSTS_LIMIT >= postsData.value.data.total)
  return true
})

useInfiniteScroll(
  () => document,
  async () => {
    if (asyncStatus.value === 'loading' || isReachEnd.value)
      return
    await loadMore()
  },
  {
    distance: 10,
    canLoadMore: () => {
      return true
    },
  },
)
</script>

<template>
  <HomePageContainer
    title="全部文章"
    description="一般写博客文章是随心所欲的，想到什么就有可能会写一些，会希望能够把好用的技术知识传递给更多的人。喜欢围绕着技术为主的话题，但是也会写一些非技术的奇奇怪怪的话题。"
  >
    <div v-if="allPosts?.length > 0 " pl="md:6" border="md:l border" w-full>
      <ul flex="~ col gap-16" pb-16>
        <li v-for="(article, index) in allPosts" :key="article.id">
          <Article :article="article" :delay="index * 0.1" />
        </li>
      </ul>
    </div>
    <div v-else>
      No Posts
    </div>

    <div v-if="!isReachEnd && asyncStatus === 'loading'" mt-30>
      <div class="loader" />
    </div>
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
