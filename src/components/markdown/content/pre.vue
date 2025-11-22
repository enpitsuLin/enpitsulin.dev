<script lang="ts" setup>
const { language } = defineProps<{
  code: string
  language?: string
  filename?: string
  highlights?: number[]
  meta?: string
}>()
const languageLength = (language?.length ?? 0)

function getBaseLog(y: number) {
  return Math.log(y) / Math.log(1.75)
}

const mr = Math.ceil((getBaseLog(languageLength) + 1) * 16) + 4
</script>

<template>
  <div
    class="group shiki-block"
    relative my-6 of-hidden rounded-md text-14px
  >
    <div
      v-if="!filename && language"
      aria-hidden="true" uppercase
      class="pointer-events-none absolute bottom-3 right-3 z-10 text-xs opacity-30"
    >
      {{ language }}
    </div>
    <div
      v-if="filename && language"
      bg="#d4d4d8/20"
      flex="~ items-center justify-between"
      class="z-10 w-full rounded-t-xl px-5 py-2 text-sm"
    >
      <span class="shrink-0 grow truncate">{{ filename }}</span>
      <span uppercase class="pointer-events-none shrink-0 grow-0" aria-hidden="true">{{ language }}</span>
    </div>
    <div bg="zinc-200 dark:zinc-800 op-5" py-4>
      <MarkdownContentCopyButton :source="code" />
      <div
        relative of-hidden
        :style="language && !filename && {
          '--pre-language-margin': `${mr}px`,
          '--mr': `${languageLength * 14 + 4}px`,
        }"
      >
        <pre m-0 max-h-100 px-4 pb-2 class="scroll-track-mr shiki bg-transparent"><slot /></pre>
      </div>
    </div>
  </div>
</template>

<style>
pre {
  scrollbar-color: initial !important;
}
pre::-webkit-scrollbar-track {
  margin-left: 1rem;
  margin-right: var(--pre-language-margin, 1rem);
}
</style>
