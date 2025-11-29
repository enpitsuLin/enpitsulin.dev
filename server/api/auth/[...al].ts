export default defineEventHandler((event) => {
  return event.context.auth.handler(toWebRequest(event))
})
