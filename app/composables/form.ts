import type { FormValidateFn, FormValidateOrFn, FormValidators } from '@tanstack/vue-form'
import z from 'zod'

export function validatorsFromSchema<
  Schema extends z.ZodSchema,
  Type extends 'submit' | 'change' | 'blur',
  TFormData = z.infer<Schema>,
>(schema: Schema, type: Type): FormValidators<
  TFormData,
  undefined,
  Type extends 'change' ? FormValidateOrFn<TFormData> : undefined,
  undefined,
  Type extends 'blur' ? FormValidateOrFn<TFormData> : undefined,
  undefined,
  Type extends 'submit' ? FormValidateOrFn<TFormData> : undefined,
  undefined,
  undefined,
  undefined
> {
  const validateFn: FormValidateFn<TFormData> = ({ value }) => {
    const result = schema.safeParse(value)
    if (result.error) {
      const flattenError = z.flattenError(result.error)
      const errorEntries = Object.entries(flattenError.fieldErrors) as [string, string[]][]
      const fields = Object.fromEntries(
        errorEntries.map(([key, value]) => ([key, value.at(0)])),
      )
      return {
        fields,
      }
    }
    return null
  }
  return {
    [`on${type.charAt(0).toUpperCase() + type.slice(1) as 'Submit' | 'Change' | 'Blur'}`]: validateFn,
  }
}
