import { env } from 'node:process'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  schema: './server/db/schema.ts',
  out: './server/db/migrations/sqlite',
  casing: 'snake_case',
  dbCredentials: {
    // for drizzle-kit studio
    url: env.DATABASE_URL!,
  },
})
