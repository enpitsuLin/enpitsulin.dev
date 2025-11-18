import { auth } from '@/auth'

export default async function (request: Request): Promise<Response> {
  return auth.handler(request)
}
