import { render } from '~/entry-server'

export default {
  async fetch(req, env, ctx) {
    // Add handler before render vue app here
    return render(req, env, ctx)
  },
} satisfies ExportedHandler<Env>
