<script setup lang="ts">
import { useMutation, useQueryCache } from '@pinia/colada'
import { motion } from 'motion-v'

const { client } = useAuth()
const queryCache = useQueryCache()
const name = ref('')
const [expanded, toggleExpanded] = useToggle(false)
const { mutate: addPasskey, isLoading: isLoadingAddPasskey } = useMutation({
  mutation(name: string) {
    return client.passkey.addPasskey({ name, useAutoRegister: false })
  },
  onSuccess() {
    queryCache.invalidateQueries({ key: ['passkeys'] })
  },
})
</script>

<template>
  <div relative w-full>
    <motion.button
      v-if="!expanded"
      type="button"
      class="group"
      bg="transparent hover:zinc-200/50 dark:hover:zinc-700/50"
      flex="inline items-center justify-between gap-2"
      p="3" w-full rounded-lg
      @click="toggleExpanded()"
    >
      <div class="i-mingcute:add-line size-4" />
      <div flex-1 text-left text-xs font-medium op-70>
        添加通行密钥
      </div>
      <div
        i-mingcute:arrow-right-line
        invisible size-4 transition-transform
        duration-200 group-hover:visible
        translate-x="-1"
        group-hover:translate-x-0
      />
    </motion.button>
    <template v-else>
      <motion.div
        flex="~ items-center gap-2"
      >
        <input
          v-model="name"
          type="email"
          autocomplete="off"
          placeholder="请输入通行密钥名称"
          w="full" p="x4 y2"
          border="~ border focus:blue-500 data-[invalid]:red-500 data-[invalid]:focus:red-500 rounded-lg"
          bg="transparent"
          class="text-xs text-zinc-900 outline-none transition-all placeholder:text-xs dark:text-white focus:ring-2 focus:ring-blue-500/20 placeholder-zinc-500 dark:placeholder-zinc-400"
        >

        <button
          type="button"
          class="group"
          bg="transparent hover:zinc-200/50 dark:hover:zinc-700/50"
          flex="inline items-center justify-between gap-2"
          p="3" rounded-lg
          @click="toggleExpanded()"
        >
          <div class="i-mingcute:close-line size-4" />
        </button>
        <button
          type="button"
          class="group"
          bg="transparent hover:zinc-200/50 dark:hover:zinc-700/50"
          flex="inline items-center justify-between gap-2"
          p="x3 y2" rounded-lg
          :disabled="isLoadingAddPasskey"
          @click="addPasskey(name)"
        >
          <div
            i-mingcute:arrow-right-line
            size-4 transition-transform
            duration-200
          />
        </button>
      </motion.div>
    </template>
  </div>
</template>
