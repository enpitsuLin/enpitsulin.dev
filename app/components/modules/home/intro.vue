<script setup lang="tsx">
const { y } = useWindowScroll()
</script>

<template>
  <section w="full" flex="~ col items-center" class="mb-10 sm:mb-0">
    <div flex="~ col-reverse md:row md:justify-between gap-8" class="w-full md:my-16">
      <div
        flex="~ col gap-4"
        class="[will-change:transform,opacity]"
      >
        <h1 text-2xl>
          Hi, 这里是 <ruby>enpitsu<rp>(</rp><rt>えんぴつ</rt><rp>)</rp>lin</ruby>。
        </h1>
        <p class="text-lg sm:text-2xl">
          是一位普通的 <code class="whitespace-nowrap font-mono">&lt;Developer /&gt;</code>。
        </p>
        <p text-sm op-60>
          每天随心所欲充满激情还有带着 🧡 地写代码.
        </p>
        <HomeIntroLinks />
      </div>
      <HomeIntroAvatar class="size-28 md:size-34" />
    </div>

    <div
      class="mt-auto hidden pb-6 pt-8 transition-opacity duration-500 sm:flex sm:justify-center"
      :class=" y > 20 ? 'op-0' : 'op-100'"
    >
      <span class="animate-bounce text-gray-500">
        <i inline-block class="i-mingcute:right-line rotate-90" />
      </span>
    </div>
  </section>
</template>

<style>
@keyframes wave-hand {
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(30deg) scale(1.1);
  }
  100% {
    transform: rotate(0deg);
  }
}
</style>
