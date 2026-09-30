<script setup lang="ts">
import type { TocLink } from '@nuxtjs/mdc'

const { links = [], activeHeadings = [] } = defineProps<{
  links?: TocLink[]
  activeHeadings?: string[]
}>()

function isActiveBranch(link: TocLink): boolean {
  return activeHeadings.includes(link.id) || Boolean(link.children?.some(isActiveBranch))
}
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
        :aria-expanded="link.children?.length ? isActiveBranch(link) : undefined"
      >
        {{ link.text }}
      </a>
      <Transition
        enter-active-class="transition-property-[grid-template-rows,opacity] duration-150 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none"
        leave-active-class="transition-property-[grid-template-rows,opacity] duration-150 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none"
        enter-from-class="grid-rows-[0fr]! op-0"
        leave-to-class="grid-rows-[0fr]! op-0"
      >
        <div v-if="link.children?.length && isActiveBranch(link)" class="grid grid-rows-[1fr]">
          <ArticleTocLinks :links="link.children" :active-headings="activeHeadings" class="min-h-0 of-hidden" />
        </div>
      </Transition>
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
