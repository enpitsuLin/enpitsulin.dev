<script setup lang="ts">
import type { TocLink } from '@nuxtjs/mdc'

const { links = [], activeHeadings = [] } = defineProps<{
  links?: TocLink[]
  activeHeadings?: string[]
}>()
</script>

<template>
  <ul class="docs-toc-links">
    <li
      v-for="link in links"
      :key="link.id"
      :class="[`depth-${link.depth}`]"
    >
      <a
        :href="`#${link.id}`"
        un-text-xs
        :class="[activeHeadings.includes(link.id) && 'active']"
        :aria-current="activeHeadings.includes(link.id) ? 'location' : undefined"
      >
        {{ link.text }}
      </a>
      <ArticleTocLinks
        v-if="link.children"
        :links="link.children"
        :active-headings="activeHeadings"
      />
    </li>
  </ul>
</template>

<style>
.docs-toc-links .depth-3 {
  --at-apply: pl-3;
}

.docs-toc-links .depth-4 {
  --at-apply: pl-6;
}

.docs-toc-links a {
  --at-apply: block py-1 text-sm text-gray-500;
  overflow-wrap: anywhere;
  transition: color 150ms;
}

.dark .docs-toc-links a {
  --at-apply: text-gray-400;
}

@media (min-width: 1024px) {
  .docs-toc-links a {
    --at-apply: pr-3;
  }
}

.docs-toc-links a:not(.active):hover {
  --at-apply: text-accent;
}
.docs-toc-links a.active {
  --at-apply: text-accent;
}

.docs-toc-links a:focus-visible {
  outline: 2px solid hsl(var(--theme-accent));
  outline-offset: -2px;
}

@media (prefers-reduced-motion: reduce) {
  .docs-toc-links a {
    transition: none;
  }
}
</style>
