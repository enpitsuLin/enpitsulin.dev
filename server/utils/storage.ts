import { createStorage } from 'unstorage'
import cloudflareKVBindingDriver from 'unstorage/drivers/cloudflare-kv-binding'

export const storage = createStorage({
  driver: cloudflareKVBindingDriver({
    binding: 'KV',
  }),
})

export function useKV() {
  return storage
}
