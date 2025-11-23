<script setup lang="ts">
import { toArray } from '@vueuse/core'
import { motion } from 'motion-v'
import { navigation } from '~/constants'

const route = useRoute()
</script>

<template>
  <header
    flex="~ items-center justify-between md:justify-center"
    sticky top-0 z-99 w="full"
    px-8 pt-5
  >
    <div pointer-events-none fixed left-0 right-0 top-0 h-25 select-none class="navbar-blur" />

    <div
      relative z-2 h="full" w="fit"
      class="transform animate-duration-1300 animate-ease-$spring-easing animate-in slide-in-from-top-70px"
    >
      <div
        v-if="route.path !== '/'"
        position="sticky top-4 md:absolute md:top-1/2 md:left--12" md:translate-y="-1/2"
      >
        <motion.img
          fetchpriority="high"
          layout-id="avatar"
          alt="avatar"
          width="250" height="250"
          decoding="async"
          class="size-9 border-2 border-white rounded-full object-cover shadow-xl"
          src="/images/avatar.webp"
        />
      </div>
      <nav
        bg="zinc-50/50 dark:zinc-950/50"
        px-8 py="2"
        border="~ border rounded-full"
        class="hidden shadow-black/10 shadow-md backdrop-blur-0.5rem transition-background-color md:flex"
      >
        <ul
          flex="~ items-center justify-center gap-2"
          class="text-0.9rem text-gray-500 font-medium"
        >
          <li
            v-for="{ href, label, match } in navigation"
            :key="label"
            relative flex="~ items-center justify-center"
            class="h-7 break-keep"
          >
            <LayoutNavBarLink
              :href="href"
              :active="toArray(match).includes(route.name)"
            >
              {{ label }}
            </LayoutNavBarLink>
          </li>
        </ul>
      </nav>
    </div>

    <LayoutNavBarMenu />
  </header>
</template>

<style>
.navbar-blur {
  --at-apply: backdrop-blur-10px op-95;
  mask-image: linear-gradient(to bottom, theme('colors.border') 10%, transparent);
}
.navbar-blur::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, theme('colors.border') 10%, transparent);
}
</style>
