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
        :class="[activeHeadings.includes(link.id) && 'active']"
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
  --at-apply: text-accent/30;
}
.docs-toc-links a.active {
  --at-apply: text-accent;
}
</style>
