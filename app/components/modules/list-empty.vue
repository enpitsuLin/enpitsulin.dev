<script setup lang="ts">
import { normalizeClass } from 'vue'

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
        class="bg-gradient-to-tr from-zinc-200 to-zinc-400 dark:from-zinc-700 dark:to-zinc-500 blur-2xl op-10 group-hover:op-20 transition-opacity duration-500"
      />
      <div
        relative p-6
        border="~ zinc-100/50 dark:zinc-800/50 rounded-full"
        ring="1 zinc-200/20 dark:zinc-700/20"
        bg="zinc-50/50 dark:zinc-900/50"
        shadow-2xl
      >
        <div
          size-10
          :un-text="normalizeClass({
            'zinc-500 group-hover:zinc-300': type === 'posts',
            'amber-500/80 group-hover:amber-400': type === 'thoughts',
          })"
          :class="[icon]"
          class="transition-colors duration-300"
        />

        <div
          absolute
          border="~ zinc-200 dark:zinc-700 rounded-full"
          bg="zinc-100 dark:zinc-800"
          class="-top-1 -right-1  p-1.5 animate-bounce delay-75"
        >
          <div :class="tipIcon" size-3 un-text="zinc-500 dark:zinc-400" />
        </div>
      </div>
    </div>

    <h3 text-xl font-medium un-text="zinc-800 dark:zinc-200" mb-2>
      {{ title }}
    </h3>
    <p
      un-text="zinc-400 dark:zinc-500"
      max-w-sm mx-auto mb-8 text-sm leading-relaxed
    >
      {{ description }}
      <br>
      <span text-xs op-70>{{ hint }}</span>
    </p>
  </div>
</template>
