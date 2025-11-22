<script setup lang="ts">
const frontendStack = [
  { name: 'HTML', icon: 'i-logos:html5' },
  { name: 'CSS', icon: 'i-logos:css3' },
  { name: 'JavaScript', icon: 'i-logos:javascript' },
  { name: 'TypeScript', icon: 'i-logos:typescript-icon' },
  { name: 'Unocss', icon: 'i-logos:unocss' },
  { name: 'Tailwind CSS', icon: 'i-logos:tailwindcss-icon' },
  { name: 'Next.js', icon: 'i-logos:nextjs-icon' },
  { name: 'React', icon: 'i-logos:react' },
  { name: 'Nuxt.js', icon: 'i-logos:nuxt-icon' },
  { name: 'Vue', icon: 'i-logos:vue' },
]

const tools = [
  { name: 'Node.js', icon: 'i-logos:nodejs' },
  { name: 'Vite', icon: 'i-logos:vitejs' },
  { name: 'Vitest', icon: 'i-logos:vitest' },
  { name: 'Git', icon: 'i-logos:git-icon' },
  { name: 'Prisma', icon: 'i-logos:prisma' },
  { name: 'Figma', icon: 'i-logos:figma' },
  { name: 'VS Code', icon: 'i-logos:visual-studio-code' },
  { name: 'Arch', icon: 'i-logos:archlinux' },
  { name: 'Markdown', icon: 'i-logos:markdown' },
  { name: 'MetaMask', icon: 'i-logos:metamask-icon' },
]
</script>

<template>
  <section>
    <h1
      w-full
      class="text-2xl text-zinc-700 font-bold tracking-tight sm:text-4xl dark:text-zinc-100"
      pb-6
    >
      技术栈/工具
    </h1>

    <div flex="~ col justify-start" relative w-full of-hidden py-2>
      <UiMarquee>
        <div
          v-for="{ name, icon } in frontendStack"
          :key="name"
          flex="~ items-center gap-2" border="~ border rounded-full"
          p="x-4 y-1" cursor-default
        >
          <i :class="icon" size-5 />
          <span text-sm>{{ name }}</span>
        </div>
      </UiMarquee>
      <UiMarquee reverse>
        <div
          v-for="{ name, icon } in tools"
          :key="name"
          flex="~ items-center gap-2" border="~ border rounded-full"
          p="x-4 y-1" cursor-default
        >
          <i :class="icon" size-5 />
          <span text-sm>{{ name }}</span>
        </div>
      </UiMarquee>
    </div>
  </section>
</template>
