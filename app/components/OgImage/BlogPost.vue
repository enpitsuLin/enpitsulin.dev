<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
}>(), {
  title: 'title',
})
</script>

<template>
  <div class="h-full w-full flex items-start justify-start border-solid border-#177CB0 border-[12px] bg-gray-50">
    <div class="flex items-start justify-start h-full">
      <div class="flex flex-col justify-between w-full h-full">
        <h1 class="text-[80px] p-20 font-black text-left" style="display: block; line-clamp: 2; text-overflow: ellipsis;">
          {{ title }}
        </h1>
        <p class="text-2xl pb-10 px-20 font-bold mb-0" style="display: block; line-clamp: 3; text-overflow: ellipsis;">
          enpitsulin.dev
        </p>
      </div>
    </div>
  </div>
</template>
