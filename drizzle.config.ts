import { env } from 'node:process'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  schema: './database/schema.ts',
  out: './database/migrations',
  casing: 'snake_case',
  dbCredentials: {
    // for drizzle-kit studio
    url: env.DATABASE_URL!,
  },
})
