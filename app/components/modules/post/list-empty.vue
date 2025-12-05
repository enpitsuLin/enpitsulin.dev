<script setup lang="ts">

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
        class="bg-gradient-to-tr from-zinc-700 to-zinc-500 blur-2xl op-10 group-hover:op-20 transition-opacity duration-500"
      />
      <div
        relative p-6
        border="~ zinc-800/50 rounded-full"
        class="bg-zinc-900/50 ring-1 ring-zinc-700/20 shadow-2xl"
      >
        <div
          i-mingcute:teacup-line size-10
          class="text-zinc-500 group-hover:text-zinc-300 transition-colors duration-300"
        />

        <div
          absolute
          border="~ zinc-700 rounded-full"
          class="-top-1 -right-1 bg-zinc-800 p-1.5 animate-bounce delay-75"
        >
          <div i-mingcute:pen-line size-3 text-zinc-400 />
        </div>
      </div>
    </div>

    <h3 text-xl font-medium text-zinc-200 mb-2>
      这里暂时空空如也
    </h3>
    <p text-zinc-500 max-w-sm mx-auto mb-8 text-sm leading-relaxed>
      博主正在努力码字中，或许你可以稍后再来看看。
      <br>
      <span text-xs op-70>（好灵感总是在洗澡时才出现 🚿）</span>
    </p>
  </div>
</template>
