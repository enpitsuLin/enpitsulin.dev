<script setup lang="ts">
import type { TocLink } from '@nuxtjs/mdc'
import UiCircularProgress from '~/components/ui/circular-progress.vue'

const { links = [], activeHeadings = [], progress = 0 } = defineProps<{
  links?: TocLink[]
  activeHeadings?: string[]
  progress?: number
}>()

const navigation = useTemplateRef<HTMLElement>('navigation')

watch(() => activeHeadings[0], () => {
  const container = navigation.value
  const activeLink = container?.querySelector<HTMLElement>('a[aria-current="location"]')
  if (!container || !activeLink)
    return

  const containerBounds = container.getBoundingClientRect()
  const linkBounds = activeLink.getBoundingClientRect()
  const containerStyles = getComputedStyle(container)
  const visibleTop = containerBounds.top + Number.parseFloat(containerStyles.paddingTop)
  const visibleBottom = containerBounds.bottom - Number.parseFloat(containerStyles.paddingBottom)
  if (linkBounds.top < visibleTop)
    container.scrollTop += linkBounds.top - visibleTop
  else if (linkBounds.bottom > visibleBottom)
    container.scrollTop += linkBounds.bottom - visibleBottom
}, { flush: 'post' })
</script>

<template>
  <section aria-label="本页内容">
    <h2 class="m-[20px_0_10px]">
      本页内容
    </h2>

    <nav ref="navigation" aria-label="文章章节" pl-4 class="article-toc-navigation">
      <ArticleTocLinks v-if="links.length" :links="links" :active-headings="activeHeadings" />
      <p v-else text-xs text="zinc-500 dark:zinc-400" py-2>
        本文暂无章节标题
      </p>
    </nav>

    <UiCircularProgress :value="progress" label="阅读进度" mt-4 pt-4 border="t border" />
  </section>
</template>

<style scoped>
.article-toc-navigation {
  --toc-fade-size: 12px;

  height: 20rem;
  max-height: max(0px, calc(100dvh - 17rem));
  padding-block: var(--toc-fade-size);
  scroll-padding-block: var(--toc-fade-size);
  overflow-y: auto;
  overscroll-behavior-y: contain;
  scrollbar-gutter: stable;
  mask-image: linear-gradient(
    to bottom,
    transparent,
    #000 var(--toc-fade-size),
    #000 calc(100% - var(--toc-fade-size)),
    transparent
  );
}
</style>
