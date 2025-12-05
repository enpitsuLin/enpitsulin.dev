<script setup lang="ts">
const { type } = defineProps<{
  type: 'posts' | 'thoughts'
}>()

const icon = type === 'posts' ? ' i-mingcute:teacup-line' : 'i-mingcute:sparkles-line'

const tipIcon = type === 'posts' ? 'i-mingcute:pen-line' : 'i-mingcute:bulb-2-line'

const title = type === 'posts' ? '这里暂时空空如也' : '灵感还在潜水'
const description = type === 'posts' ? '博主正在努力码字中，或许你可以稍后再来看看。' : '现在的脑袋空空如也，没有任何想法。'
const hint = type === 'posts' ? '（好灵感总是在洗澡时才出现 🚿）' : '（或许去散散步能捕捉到一些灵感 ✨）'
</script>

<template>
  <div
    flex="~ col items-center justify-center"
    w-full py-24 text-center animate-fade-in
  >
    <div relative mb-8 class="group">
      <div
        rounded-full
        absolute inset-0
        class="bg-gradient-to-tr from-zinc-700 to-zinc-500 blur-2xl op-10 group-hover:op-20 transition-opacity duration-500"
      />
      <div
        relative p-6
        border="~ zinc-800/50 rounded-full"
        class="bg-zinc-900/50 ring-1 ring-zinc-700/20 shadow-2xl"
      >
        <div
          size-10
          :class="[icon, type === 'posts' ? 'text-zinc-500 group-hover:text-zinc-300 ' : 'text-amber-500/80 group-hover:text-amber-400']"
          class="transition-colors duration-300"
        />

        <div
          absolute
          border="~ zinc-700 rounded-full"
          class="-top-1 -right-1 bg-zinc-800 p-1.5 animate-bounce delay-75"
        >
          <div :class="tipIcon" size-3 text-zinc-400 />
        </div>
      </div>
    </div>

    <h3 text-xl font-medium text-zinc-200 mb-2>
      {{ title }}
    </h3>
    <p text-zinc-500 max-w-sm mx-auto mb-8 text-sm leading-relaxed>
      {{ description }}
      <br>
      <span text-xs op-70>{{ hint }}</span>
    </p>
  </div>
</template>
