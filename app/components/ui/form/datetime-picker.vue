<script setup lang="ts">
import type { DatePickerRootProps, DateValue } from '@ark-ui/vue/date-picker'
import { DatePicker, parseDate } from '@ark-ui/vue/date-picker'

const { value } = defineProps<{
  value?: Date
}>()

const emit = defineEmits<{
  'update:value': [value: Date | undefined]
}>()

const modelValue = computed<DateValue[]>({
  get() {
    if (value)
      return [parseDate(value)]
    return []
  },
  set(newValues) {
    if (newValues.length === 0)
      return emit('update:value', undefined)
    emit('update:value', newValues[0]!.toDate('Asia/Shanghai'))
  },
})

const format: DatePickerRootProps['format'] = (date) => {
  const d = date.toDate('Asia/Shanghai')
  return d.toLocaleDateString('zh-CN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <DatePicker.Root
    v-model="modelValue"
    class="group datetime-picker" w-full
    :positioning="{
      placement: 'bottom-start',
      sameWidth: true,
    }"
    :format="format"
    :start-of-week="1"
    time-zone="Asia/Shanghai"
  >
    <DatePicker.Control
      relative col-span-2 flex-1 p="x4 y2"
      border="~ border group-data-[state=open]:blue-500 data-[invalid]:red-500 data-[invalid]:focus:red-500 rounded-lg"
      bg="transparent"
      class="text-xs text-zinc-900 outline-none transition-all placeholder:text-xs dark:text-white group-data-[state=open]:ring-2 group-data-[state=open]:ring-blue-500/20 placeholder-zinc-500 dark:placeholder-zinc-400"
    >
      <DatePicker.Input w-full appearance-none bg-transparent />
      <DatePicker.Trigger absolute inset-0 flex="~ items-center justify-end" px-2>
        <div i-mingcute:right-fill rotate-90 />
      </DatePicker.Trigger>
    </DatePicker.Control>
    <DatePicker.Positioner>
      <DatePicker.Content
        w-80 p-4
        border="~ border rounded-xl"
        bg="white/95 dark:zinc-900/95"
        class="z-100 origin-top-center backdrop-blur-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
      >
        <DatePicker.View view="day" flex="not-[[hidden]]:~ col gap-4 items-center justify-center" py-4>
          <DatePicker.Context v-slot="api">
            <DatePicker.ViewControl w-full flex="~ justify-between">
              <DatePicker.PrevTrigger as-child>
                <button
                  type="button"
                  h-9 rounded px-4
                  flex="inline items-center justify-center"
                  bg="transparent data-[disabled]:transparent! data-[selected]:zinc-700/10 dark:data-[selected]:zinc-100/10 hover:zinc-700/10 dark:hover:zinc-100/10"
                  class="data-[disabled]:cursor-not-allowed data-[disabled]:op-50"
                >
                  <div i-mingcute:right-fill rotate-180 />
                </button>
              </DatePicker.PrevTrigger>
              <DatePicker.ViewTrigger as-child>
                <button
                  type="button"
                  h-9 rounded px-4
                  flex="inline items-center justify-center"
                  bg="transparent data-[disabled]:transparent! data-[selected]:zinc-700/10 dark:data-[selected]:zinc-100/10 hover:zinc-700/10 dark:hover:zinc-100/10"
                  class="data-[disabled]:cursor-not-allowed data-[disabled]:op-50"
                >
                  <DatePicker.RangeText />
                </button>
              </DatePicker.ViewTrigger>
              <DatePicker.NextTrigger as-child>
                <button
                  type="button"
                  h-9 rounded px-4
                  flex="inline items-center justify-center"
                  bg="transparent data-[disabled]:transparent! data-[selected]:zinc-700/10 dark:data-[selected]:zinc-100/10 hover:zinc-700/10 dark:hover:zinc-100/10"
                  class="data-[disabled]:cursor-not-allowed data-[disabled]:op-50"
                >
                  <div i-mingcute:right-fill />
                </button>
              </DatePicker.NextTrigger>
            </DatePicker.ViewControl>
            <DatePicker.Table w-full>
              <DatePicker.TableHead border="b border">
                <DatePicker.TableRow>
                  <DatePicker.TableHeader
                    v-for="(weekDay, id) in api.weekDays"
                    :key="id" un-text-sm
                    class="op-50" size-9
                  >
                    {{ weekDay.narrow }}
                  </DatePicker.TableHeader>
                </DatePicker.TableRow>
              </DatePicker.TableHead>
              <DatePicker.TableBody>
                <DatePicker.TableRow
                  v-for="(week, id) in api.weeks"
                  :key="id"
                >
                  <DatePicker.TableCell v-for="(day, id) in week" :key="id" :value="day">
                    <DatePicker.TableCellTrigger as-child>
                      <button
                        type="button"
                        size-9 rounded
                        flex="inline items-center justify-center"
                        bg="transparent data-[disabled]:transparent! data-[selected]:zinc-700/10 dark:data-[selected]:zinc-100/10 hover:zinc-700/10 dark:hover:zinc-100/10"
                        class="data-[disabled]:cursor-not-allowed data-[disabled]:op-50"
                      >
                        {{ day.day }}
                      </button>
                    </DatePicker.TableCellTrigger>
                  </DatePicker.TableCell>
                </DatePicker.TableRow>
              </DatePicker.TableBody>
            </DatePicker.Table>
          </DatePicker.Context>
        </DatePicker.View>

        <DatePicker.View view="month" flex="not-[[hidden]]:~ col gap-4 items-center justify-center" py-4>
          <DatePicker.Context v-slot="api">
            <DatePicker.ViewControl w-full flex="~ justify-between">
              <DatePicker.PrevTrigger as-child>
                <button
                  type="button"
                  h-9 rounded px-4
                  flex="inline items-center justify-center"
                  bg="transparent data-[disabled]:transparent! data-[selected]:zinc-700/10 dark:data-[selected]:zinc-100/10 hover:zinc-700/10 dark:hover:zinc-100/10"
                  class="data-[disabled]:cursor-not-allowed data-[disabled]:op-50"
                >
                  <div i-mingcute:right-fill rotate-180 />
                </button>
              </DatePicker.PrevTrigger>
              <DatePicker.ViewTrigger as-child>
                <button
                  type="button"
                  h-9 rounded px-4
                  flex="inline items-center justify-center"
                  bg="transparent data-[disabled]:transparent! data-[selected]:zinc-700/10 dark:data-[selected]:zinc-100/10 hover:zinc-700/10 dark:hover:zinc-100/10"
                  class="data-[disabled]:cursor-not-allowed data-[disabled]:op-50"
                >
                  <DatePicker.RangeText />
                </button>
              </DatePicker.ViewTrigger>
              <DatePicker.NextTrigger as-child>
                <button
                  type="button"
                  h-9 rounded px-4
                  flex="inline items-center justify-center"
                  bg="transparent data-[disabled]:transparent! data-[selected]:zinc-700/10 dark:data-[selected]:zinc-100/10 hover:zinc-700/10 dark:hover:zinc-100/10"
                  class="data-[disabled]:cursor-not-allowed data-[disabled]:op-50"
                >
                  <div i-mingcute:right-fill />
                </button>
              </DatePicker.NextTrigger>
            </DatePicker.ViewControl>
            <DatePicker.Table w-full>
              <DatePicker.TableBody>
                <DatePicker.TableRow
                  v-for="(months, id) in api.getMonthsGrid({ columns: 4, format: 'short' })"
                  :key="id"
                >
                  <DatePicker.TableCell
                    v-for="(month, id) in months"
                    :key="id"
                    :value="month.value"
                  >
                    <DatePicker.TableCellTrigger as-child>
                      <button
                        flex="inline items-center justify-center"
                        type="button"
                        w-full rounded py-2
                        bg="transparent data-[disabled]:transparent! data-[selected]:zinc-700/10 dark:data-[selected]:zinc-100/10 hover:zinc-700/10 dark:hover:zinc-100/10"
                        class="data-[disabled]:cursor-not-allowed data-[disabled]:op-50"
                      >
                        {{ month.label }}
                      </button>
                    </DatePicker.TableCellTrigger>
                  </DatePicker.TableCell>
                </DatePicker.TableRow>
              </DatePicker.TableBody>
            </DatePicker.Table>
          </DatePicker.Context>
        </DatePicker.View>

        <DatePicker.View view="year" flex="not-[[hidden]]:~ col gap-4 items-center justify-center" py-4>
          <DatePicker.Context v-slot="api">
            <DatePicker.ViewControl w-full flex="~ justify-between">
              <DatePicker.PrevTrigger as-child>
                <button
                  type="button"
                  h-9 rounded px-4
                  flex="inline items-center justify-center"
                  bg="transparent data-[disabled]:transparent! data-[selected]:zinc-700/10 dark:data-[selected]:zinc-100/10 hover:zinc-700/10 dark:hover:zinc-100/10"
                  class="data-[disabled]:cursor-not-allowed data-[disabled]:op-50"
                >
                  <div i-mingcute:right-fill rotate-180 />
                </button>
              </DatePicker.PrevTrigger>
              <DatePicker.ViewTrigger as-child>
                <button
                  type="button"
                  h-9 rounded px-4
                  flex="inline items-center justify-center"
                  bg="transparent data-[disabled]:transparent! data-[selected]:zinc-700/10 dark:data-[selected]:zinc-100/10 hover:zinc-700/10 dark:hover:zinc-100/10"
                  class="data-[disabled]:cursor-not-allowed data-[disabled]:op-50"
                >
                  <DatePicker.RangeText />
                </button>
              </DatePicker.ViewTrigger>
              <DatePicker.NextTrigger as-child>
                <button
                  type="button"
                  h-9 rounded px-4
                  flex="inline items-center justify-center"
                  bg="transparent data-[disabled]:transparent! data-[selected]:zinc-700/10 dark:data-[selected]:zinc-100/10 hover:zinc-700/10 dark:hover:zinc-100/10"
                  class="data-[disabled]:cursor-not-allowed data-[disabled]:op-50"
                >
                  <div i-mingcute:right-fill />
                </button>
              </DatePicker.NextTrigger>
            </DatePicker.ViewControl>
            <DatePicker.Table w-full>
              <DatePicker.TableBody>
                <DatePicker.TableRow
                  v-for="(years, id) in api.getYearsGrid({ columns: 4 })" :key="id"
                >
                  <DatePicker.TableCell
                    v-for="(year, id) in years"
                    :key="id"
                    :value="year.value"
                  >
                    <DatePicker.TableCellTrigger as-child>
                      <button
                        flex="inline items-center justify-center"
                        type="button"
                        w-full rounded py-2
                        bg="transparent data-[disabled]:transparent! data-[selected]:zinc-700/10 dark:data-[selected]:zinc-100/10 hover:zinc-700/10 dark:hover:zinc-100/10"
                        class="data-[disabled]:cursor-not-allowed data-[disabled]:op-50"
                      >
                        {{ year.label }}
                      </button>
                    </DatePicker.TableCellTrigger>
                  </DatePicker.TableCell>
                </DatePicker.TableRow>
              </DatePicker.TableBody>
            </DatePicker.Table>
          </DatePicker.Context>
        </DatePicker.View>
      </DatePicker.Content>
    </DatePicker.Positioner>
  </DatePicker.Root>
</template>

<style>
.datetime-picker thead,
.datetime-picker tbody {
  display: flex;
  flex-direction: column;
}

.datetime-picker thead tr,
.datetime-picker tbody tr {
  display: flex;
  flex: 1;
  justify-content: space-around;
}

.datetime-picker thead tr th,
.datetime-picker tbody tr td {
  flex: 1;
}
</style>
