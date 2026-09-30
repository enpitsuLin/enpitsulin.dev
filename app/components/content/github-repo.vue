<script setup lang="ts">
import type { GitHubRepo } from '#shared/types/github'
import { normalizeGitHubRepo } from '#shared/utils/github-repo'

const props = withDefaults(defineProps<{
  repo: string
  mode?: 'block' | 'inline'
}>(), {
  mode: 'block',
})
const repository = computed(() => normalizeGitHubRepo(props.repo))

// Articles are prerendered; fetch on the client to keep repository stats fresh.
const { data, error } = useFetch<GitHubRepo>(() => `/api/github/${repository.value || ''}`, {
  server: false,
  lazy: true,
  cache: 'no-cache',
  enabled: () => Boolean(repository.value),
  timeout: 10000,
  retry: 0,
})

const fullName = computed(() => data.value?.fullName || repository.value || props.repo)
const owner = computed(() => fullName.value.split('/')[0])
const name = computed(() => fullName.value.split('/')[1])
const description = computed(() => data.value
  ? data.value.description || '这个仓库还没有简介。'
  : error.value ? '暂时无法获取仓库信息，点击查看 GitHub 仓库。' : '正在加载仓库信息…')
const avatarFailed = ref(false)
watch(() => data.value?.avatarUrl, () => {
  avatarFailed.value = false
})
const numberFormat = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
</script>

<template>
  <a
    v-if="repository"
    :href="`https://github.com/${fullName}`" target="_blank" rel="nofollow noopener noreferrer"
    :aria-label="`在 GitHub 查看 ${fullName}（新窗口打开）`"
    :title="mode === 'inline' ? `${fullName} — ${description}` : undefined"
    class="not-prose group"
    :class="mode === 'inline'
      ? 'inline-flex max-w-full items-center gap-1.5 rounded-md px-2 py-0.5 align-middle text-[0.95em] leading-5'
      : 'mx-auto my-6 block w-full max-w-sm rounded-xl p-4'"
    min-w-0 decoration-none
    bg="white dark:zinc-900/60"
    border="~ zinc-200 dark:zinc-800 hover:accent/50 dark:hover:accent/50"
    ring="focus-visible:2 focus-visible:accent" ring-offset="2 background"
    transition="colors duration-200 motion-reduce:none"
  >
    <template v-if="mode === 'inline'">
      <img
        v-if="data?.avatarUrl && !avatarFailed" :src="data.avatarUrl" alt="" width="16" height="16"
        size-4 shrink-0 rounded-sm loading="lazy" decoding="async" @error="avatarFailed = true"
      >
      <span v-else class="i-mingcute:github-line" shrink-0 un-text="zinc-500 dark:zinc-400" aria-hidden="true" />
      <span min-w-0 truncate un-text="zinc-800 dark:zinc-200 group-hover:accent" font-medium>
        {{ fullName }}
      </span>
      <span v-if="data" flex="~ items-center gap-1" shrink-0 pl-1.5 border="l zinc-200 dark:zinc-700" un-text="xs zinc-500 dark:zinc-400" :aria-label="`${data.stars} stars`">
        <span class="i-mingcute:star-line" aria-hidden="true" />
        {{ numberFormat.format(data.stars) }}
      </span>
    </template>

    <template v-else>
      <span flex="~ items-center gap-3" min-w-0>
        <span
          flex="~ items-center justify-center" size-12 shrink-0 rounded-lg overflow-hidden
          bg="zinc-100 dark:zinc-800" un-text="zinc-700 dark:zinc-200"
        >
          <img
            v-if="data?.avatarUrl && !avatarFailed" :src="data.avatarUrl" alt="" width="48" height="48"
            size-full object-cover loading="lazy" decoding="async" @error="avatarFailed = true"
          >
          <span v-else class="i-mingcute:github-line" text-xl aria-hidden="true" />
        </span>
        <span flex="~ col gap-1" flex-1 min-w-0>
          <span un-text="xs zinc-500 dark:zinc-400" leading-4 break-words>{{ owner }}</span>
          <span un-text="lg zinc-900 dark:zinc-100 group-hover:accent" leading-6 font-semibold break-words>{{ name }}</span>
          <span un-text="xs zinc-600 dark:zinc-400" leading-4.5 break-words line-clamp-2>
            {{ description }}
          </span>
        </span>
      </span>

      <span mt-3 pt-2.5 min-h-6 flex="~ wrap items-center justify-between gap-x-3 gap-y-2" border="t zinc-100 dark:zinc-800" un-text="xs zinc-500 dark:zinc-400">
        <template v-if="data">
          <span flex="~ wrap items-center gap-3">
            <span v-if="data.language" flex="~ items-center gap-1.5">
              <span size-2 rounded-full bg-accent aria-hidden="true" />
              {{ data.language }}
            </span>
            <span v-if="data.license">{{ data.license }}</span>
          </span>
          <span flex="~ items-center gap-3">
            <span flex="~ items-center gap-1" :title="`${data.stars.toLocaleString('en-US')} stars`" :aria-label="`${data.stars} stars`">
              <span class="i-mingcute:star-line" aria-hidden="true" />
              {{ numberFormat.format(data.stars) }}
            </span>
            <span flex="~ items-center gap-1" :title="`${data.forks.toLocaleString('en-US')} forks`" :aria-label="`${data.forks} forks`">
              <span class="i-carbon:fork" aria-hidden="true" />
              {{ numberFormat.format(data.forks) }}
            </span>
          </span>
        </template>
      </span>
    </template>
  </a>
  <span
    v-else class="not-prose"
    :class="mode === 'inline' ? 'inline' : 'my-6 block text-center'"
    un-text="sm zinc-500 dark:zinc-400"
  >
    仓库名称需使用 owner/name 格式。
  </span>
</template>
