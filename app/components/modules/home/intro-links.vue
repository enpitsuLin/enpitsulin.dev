<script setup lang="tsx">
const props = defineProps<{
  excludes?: string[]
}>()

const links = [
  {
    name: 'Email',
    href: 'mailto://enpitsulin@gmail.com',
    icon: 'i-mingcute:mail-line',
    class: 'bg-#c45040',
  },
  {
    name: 'Twitter: @enpitsulin',
    href: 'https://twitter.com/enpitsulin',
    icon: 'i-mingcute:twitter-line',
    class: 'bg-#4d9feb',
  },
  {
    name: 'Github: enpitsulin',
    href: 'https://github.com/enpitsulin',
    icon: 'i-mingcute:github-line',
    class: 'bg-black',
  },
  {
    name: 'Mastodon: enpitsulin@m.cmx.im',
    href: 'https://elk.zone/m.cmx.im/@enpitsulin',
    icon: 'i-mingcute:mastodon-fill',
    class: 'bg-#479fd1',
  },
  {
    name: 'Bilibili',
    href: 'https://space.bilibili.com/423632',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M7.172 2.757L10.414 6h3.171l3.243-3.242a1 1 0 1 1 1.415 1.415L16.414 6H18.5A3.5 3.5 0 0 1 22 9.5v8a3.5 3.5 0 0 1-3.5 3.5h-13A3.5 3.5 0 0 1 2 17.5v-8A3.5 3.5 0 0 1 5.5 6h2.085L5.757 4.171a1 1 0 0 1 1.415-1.415M18.5 8h-13a1.5 1.5 0 0 0-1.493 1.356L4 9.5v8a1.5 1.5 0 0 0 1.356 1.493L5.5 19h13a1.5 1.5 0 0 0 1.493-1.355L20 17.5v-8A1.5 1.5 0 0 0 18.5 8M8 11a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1m8 0a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1" /></svg>,
    class: 'bg-#e479b4',
  },
  {
    name: 'RSS',
    href: '/feed.xml',
    icon: 'i-mingcute:rss-line',
    class: 'bg-#f2a93b',
  },
]

const showLinks = computed(() => {
  return links.filter(link => !props.excludes?.includes(link.name))
})
</script>

<template>
  <div mt-4>
    <ul flex="~ gap-2">
      <li v-for="link in showLinks" :key="link.name">
        <UiTooltip>
          <a
            flex="~ items-center justify-center"
            inline-block aspect-square size-9
            rounded-full text-white
            rel="noreferrer"
            class="group"
            :href="link.href"
            :class="link.class"
          >
            <span class="sr-only">{{ link.name }}</span>
            <i v-if="typeof link.icon === 'string'" inline-block class="transition-transform group-hover:scale-110" :class="link.icon" />
            <component :is="link.icon" v-else class="transition-transform group-hover:scale-110" />
          </a>
          <template #content>
            {{ link.name }}
          </template>
        </UiTooltip>
      </li>
    </ul>
  </div>
</template>
