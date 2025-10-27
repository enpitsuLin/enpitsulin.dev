<script setup lang="ts">
import type { useField } from '@ark-ui/vue/field'
import type { FieldSlotProps } from 'vee-validate'
import type { UnwrapRef } from 'vue'
import { Field } from '@ark-ui/vue/field'
import { Field as FormField } from 'vee-validate'

defineProps<{
  name: string
  label: string
  helperText?: string
}>()

function mergeProps(fieldSlot: FieldSlotProps<any>, field: UnwrapRef<ReturnType<typeof useField>>) {
  return {
    props: {
      ...fieldSlot.componentField,
      ...field.getInputProps(),
    },
  }
}
</script>

<template>
  <FormField :name>
    <template #default="fieldSlot">
      <Field.Root space-y-2 :invalid="!!fieldSlot.errorMessage">
        <Field.Label
          un-text="xs font-medium text-zinc-700 dark:text-zinc-300" block
        >
          {{ label }}
        </Field.Label>
        <Field.Context v-slot="field">
          <slot v-bind="mergeProps(fieldSlot, field)" />
        </Field.Context>
        <Field.HelperText v-if="helperText" un-text="xs">
          {{ helperText }}
        </Field.HelperText>

        <Field.ErrorText v-if="fieldSlot.errorMessage" inline-block un-text="xs red-500">
          {{ fieldSlot.errorMessage }}
        </Field.ErrorText>
      </Field.Root>
    </template>
  </FormField>
</template>
