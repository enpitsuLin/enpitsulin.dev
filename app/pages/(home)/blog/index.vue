<script setup lang="ts">
const { data: posts } = useQuery({
  key: ['posts'],
  query: async () => {
    const response = await $fetch('/api/post', { query: { limit: 10, offset: 0 } })
    return response
  },
})
</script>

<template>
  <div role="banner" pb="10 md:20" w-full pt-10>
    <h2
      pb-10 text="4xl md:6xl"
      class="animate-in fade-in slide-in-from-left-16 animate-duration-800! animate-ease-$spring-easing!"
    >
      全部文章
    </h2>
    <p
      class="animate-delay-100 text-sm op-60 animate-in fade-in slide-in-from-left-16 animate-duration-1000! animate-ease-$spring-easing! md:text-base"
    >
      一般写博客文章是随心所欲的，想到什么就有可能会写一些，会希望能够把好用的技术知识传递给更多的人。喜欢围绕着技术为主的话题，但是也会写一些非技术的奇奇怪怪的话题。
    </p>
  </div>
  <div v-if="posts && posts?.data?.length > 0 " pl="md:6" border="md:l border" w-full>
    <ul flex="~ col gap-16" pb-16>
      <li v-for="(article, index) in posts?.data" :key="article.id">
        <Article :article="article" :delay="index * 0.1" />
      </li>
    </ul>
  </div>
</template>
