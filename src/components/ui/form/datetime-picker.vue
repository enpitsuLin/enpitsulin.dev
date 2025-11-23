<script setup lang="ts">
import type { DateValue } from '@ark-ui/vue/date-picker'
import type { Ref } from 'vue'
import { DatePicker, parseDate } from '@ark-ui/vue/date-picker'
import { ref } from 'vue'

const value = ref([parseDate('2022-01-01')]) as Ref<DateValue[]>
</script>

<template>
  <DatePicker.Root
    v-model="value"
    class="group" w-full
    :positioning="{
      placement: 'bottom-start',
      sameWidth: true,
    }"
    :start-of-week="1"
  >
    <DatePicker.Label
      un-text="xs font-medium text-zinc-700 dark:text-zinc-300"
    >
      Label
    </DatePicker.Label>
    <div role="group" flex="~ col gap-2" w-full>
      <DatePicker.Control
        relative
        flex-1 p="x4 y2"
        border="~ border group-data-[state=open]:blue-500 data-[invalid]:red-500 data-[invalid]:focus:red-500 rounded-lg"
        bg="transparent"
        class="text-xs text-zinc-900 outline-none transition-all placeholder:text-xs dark:text-white group-data-[state=open]:ring-2 group-data-[state=open]:ring-blue-500/20 placeholder-zinc-500 dark:placeholder-zinc-400"
      >
        <DatePicker.Input />
        <DatePicker.Trigger absolute inset-0 flex="~ items-center justify-end" px-2>
          <div i-mingcute:right-fill rotate-90 />
        </DatePicker.Trigger>
      </DatePicker.Control>
      <input
        type="time"
        step="1"
        defaultValue="10:30:00"
        flex-1 p="x4 y2"
        border="~ border focus:blue-500 data-[invalid]:red-500 data-[invalid]:focus:red-500 rounded-lg"
        bg="transparent"
        class="text-xs text-zinc-900 outline-none transition-all [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none placeholder:text-xs dark:text-white focus:ring-2 focus:ring-blue-500/20 placeholder-zinc-500 dark:placeholder-zinc-400"
      >
    </div>
    <DatePicker.Positioner>
      <DatePicker.Content
        p-4
        border="~ border rounded-xl"
        bg="white/95 dark:zinc-900/95"
        class="z-100 origin-top-center backdrop-blur-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
      >
        <DatePicker.ViewControl flex="~ justify-between">
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
        <DatePicker.View view="day" flex="not-[[hidden]]:~ items-center justify-center" py-4>
          <DatePicker.Context v-slot="api">
            <DatePicker.Table w-full>
              <DatePicker.TableHead border="b border">
                <DatePicker.TableRow>
                  <DatePicker.TableHeader
                    v-for="(weekDay, id) in api.weekDays"
                    :key="id" un-text-sm
                    class="op-50" size-9
                  >
                    {{ weekDay.short }}
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

        <DatePicker.View view="month" flex="not-[[hidden]]:~ items-center justify-center" py-4>
          <DatePicker.Context v-slot="api">
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

        <DatePicker.View view="year" flex="not-[[hidden]]:~ items-center justify-center" py-4>
          <DatePicker.Context v-slot="api">
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
