<script setup lang="tsx">
definePageMeta({
  layout: 'home',
})

const { data: value } = await useAsyncData('about-page', () => queryCollection('about').first())

if (!value.value)
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })

defineRouteRules({ prerender: true })
</script>

<template>
  <HomePageContainer
    title="关于"
  >
    <ContentRenderer
      tag="article"
      class="w-full text-14px animate-delay-100 prose animate-in fade-in max-w-unset! animate-duration-800! animate-ease-$spring-easing! dark:prose-invert"
      :value="value!.body"
    />
  </HomePageContainer>
</template>
