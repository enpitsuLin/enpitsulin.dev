<script setup lang="ts">
import { TagsInput } from '@ark-ui/vue/tags-input'
import { AnimatePresence, motion } from 'motion-v'

defineProps<{
  value?: string[]
  invalid?: boolean
  placeholder?: string
}>()

const emit = defineEmits<{
  change: [value: string[]]
}>()

function handleValueChange(details: { value: string[] }) {
  emit('change', details.value)
}
</script>

<template>
  <TagsInput.Root
    :model-value="value"
    :delimiter="/,|，/"
    :invalid="invalid"
    :editable="false"
    @value-change="handleValueChange"
  >
    <TagsInput.Context v-slot="tagsInput">
      <TagsInput.Control
        flex="~ wrap items-center gap-2"
        w="full" p="x4 y2"
        border="~ border focus:blue-500 data-[invalid]:red-500 data-[invalid]:focus:red-500 rounded-lg"
        bg="transparent"
        :data-invalid="invalid ? '' : undefined"
        class="text-xs text-zinc-900 font-mono outline-none transition-all placeholder:text-xs dark:text-white focus:ring-2 focus:ring-blue-500/20 placeholder-zinc-500 dark:placeholder-zinc-400"
      >
        <AnimatePresence>
          <motion.div
            v-for="(value, index) in tagsInput.value"
            :key="value"
            layout
            :initial="{ opacity: 0, scale: 0.8 }"
            :animate="{ opacity: 1, scale: 1 }"
            :exit="{ opacity: 0, scale: 0.8 }"
            :transition="{ duration: 0.2 }"
          >
            <TagsInput.Item
              :index="index"
              :value="value"
              un-text="white xs" font-medium
              class="inline-flex items-center gap-1.5 rounded-md bg-accent px-1.5 py-0.25"
            >
              <TagsInput.ItemPreview class="flex cursor-default items-center gap-1.5">
                <TagsInput.ItemText>{{ value }}</TagsInput.ItemText>
                <TagsInput.ItemDeleteTrigger
                  class="cursor-pointer rounded-full p-0.5 transition-colors hover:bg-white/20"
                >
                  <i class="i-carbon:close block size-3 text-white" />
                </TagsInput.ItemDeleteTrigger>
              </TagsInput.ItemPreview>
              <TagsInput.ItemInput />
            </TagsInput.Item>
          </motion.div>
        </AnimatePresence>

        <TagsInput.Input
          :placeholder="placeholder"
          class="min-w-[120px] flex-1 bg-transparent text-sm text-gray-900 outline-none dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />
      </TagsInput.Control>
    </TagsInput.Context>
    <TagsInput.HiddenInput />
  </TagsInput.Root>
</template>
