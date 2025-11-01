<script setup lang="ts">
defineOptions({
  name: 'BlogHeader',
})
</script>

<template>
  <div role="banner" pb="10 md:20" w-full pt-10>
    <h2
      pb-10 text="4xl md:6xl"
      class="animate-in fade-in slide-in-from-left-16 animate-duration-800! animate-ease-$spring-easing!"
    >
      title
    </h2>
    <p
      class="animate-delay-100 text-sm op-60 animate-in fade-in slide-in-from-left-16 animate-duration-1000! animate-ease-$spring-easing! md:text-base"
    >
      Lorem, ipsum dolor sit amet consectetur adipisicing elit. Praesentium laboriosam cumque distinctio rerum ab incidunt, voluptates est? Illo, eligendi fugit?
    </p>
  </div>
</template>
