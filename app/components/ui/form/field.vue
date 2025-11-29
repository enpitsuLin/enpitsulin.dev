<script setup lang="ts" generic="TParentData, TName extends DeepKeys<TParentData>">
import type { DeepKeys, DeepValue, FieldApi } from '@tanstack/vue-form'
import { Field } from '@ark-ui/vue/field'

defineProps<{
  field: FieldApi<
    TParentData,
    TName,
    DeepValue<TParentData, TName>,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >
  label: string
  helperText?: string
}>()

defineSlots<{
  default: (props: {
    value: DeepValue<TParentData, TName>
    onInput: (e: Event) => void
    onBlur: () => void
    handleChange: (value: DeepValue<TParentData, TName>) => void
  }) => VNode
}>()
</script>

<template>
  <Field.Root space-y-2 :invalid="field.state.meta.errors.length > 0">
    <Field.Label
      un-text="xs font-medium text-zinc-700 dark:text-zinc-300" block
    >
      {{ label }}
    </Field.Label>
    <Field.Context>
      <slot
        :value="field.state.value"
        :on-input="(e: Event) => field.handleChange((e.target as HTMLInputElement).value as DeepValue<TParentData, TName>)"
        :on-blur="field.handleBlur"
        :handle-change="field.handleChange"
      />
    </Field.Context>
    <Field.HelperText v-if="helperText" un-text="xs">
      {{ helperText }}
    </Field.HelperText>

    <Field.ErrorText v-if="field.state.meta.errors.length > 0" inline-block un-text="xs red-500">
      {{ field.state.meta.errors[0] }}
    </Field.ErrorText>
  </Field.Root>
</template>
