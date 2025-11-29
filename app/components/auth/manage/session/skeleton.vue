<template>
  <div
    bg="transparent"
    flex="inline items-center justify-between gap-2"
    p="x4 y3"
    w-full animate-pulse rounded-lg
  >
    <div
      bg="zinc-200 dark:zinc-700"
      size-20 rounded-lg px-5
    />

    <div flex="~ col items-start gap-1 1" text-left text-xs>
      <div flex="~ items-center gap-2">
        <div
          h-4 w-24
          bg="zinc-200 dark:zinc-700"
          rounded
        />
      </div>

      <!-- 浏览器信息 -->
      <div
        h-3 w-20
        bg="zinc-200 dark:zinc-700"
        rounded
      />

      <!-- IP 地址 -->
      <div
        h-3 w-28
        bg="zinc-200 dark:zinc-700"
        rounded
      />

      <!-- 时间 -->
      <div
        h-3 w-32
        bg="zinc-200 dark:zinc-700"
        rounded
      />
    </div>
  </div>
</template>
