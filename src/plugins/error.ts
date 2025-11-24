import { defineZootPlugin } from '~~/lib/app'
import { definePayloadReducer, definePayloadReviver } from '~~/lib/payload'

export default defineZootPlugin(() => {
  definePayloadReducer('error', (data: unknown) => {
    return isError(data) && [data.message, data.name]
  })

  definePayloadReviver('error', (data: [string, string | undefined, string | undefined]) => {
    const [message, name] = data
    const error = new Error(message)
    if (name)
      error.name = name
    return error
  })
})

function isError(data: unknown): data is Error {
  return data instanceof Error
}
