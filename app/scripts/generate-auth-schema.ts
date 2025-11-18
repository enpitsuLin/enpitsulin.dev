import type { DB } from 'better-auth/adapters/drizzle'
import type { BetterAuthDBSchema, DBFieldAttribute } from 'better-auth/db'
import type { BetterAuthOptions } from 'better-auth/types'
import { existsSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { getAuthTables } from 'better-auth/db'
import { ESLint } from 'eslint'
import { baseServerOptions } from '../src/lib/auth/options'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function convertToSnakeCase(str: string, camelCase?: boolean) {
  if (camelCase) {
    return str
  }
  // Handle consecutive capitals (like ID, URL, API) by treating them as a single word
  return str
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2') // Handle AABb -> AA_Bb
    .replace(/([a-z\d])([A-Z])/g, '$1_$2') // Handle aBb -> a_Bb
    .toLowerCase()
}

async function generateDrizzleSchema({
  options,
  file,
  adapter,
}: {
  options: BetterAuthOptions
  file: string
  adapter: DB
}) {
  const tables = getAuthTables(options)
  const filePath = file || './auth-schema.ts'
  // Only SQLite is supported
  if (adapter.options?.provider && adapter.options.provider !== 'sqlite') {
    throw new Error(
      `Only SQLite database is supported. Please set provider to 'sqlite' in the Drizzle adapter config.`,
    )
  }
  const fileExist = existsSync(filePath)

  let code: string = generateImport(tables)

  for (const tableKey in tables) {
    const table = tables[tableKey]!
    const modelName = getModelName(table.modelName, adapter.options)
    const fields = table.fields

    function getType(name: string, field: DBFieldAttribute) {
      name = convertToSnakeCase(name, adapter.options?.camelCase)
      if (field.references?.field === 'id') {
        if (options.advanced?.database?.useNumberId) {
          return `integer('${name}')`
        }
        return `text('${name}')`
      }
      const type = field.type
      if (typeof type !== 'string') {
        if (Array.isArray(type) && type.every(x => typeof x === 'string')) {
          return `text({ enum: [${type.map(x => `'${x}'`).join(', ')}] })`
        }
        else {
          throw new TypeError(
            `Invalid field type for field ${name} in model ${modelName}`,
          )
        }
      }
      const typeMap: Record<typeof type, string> = {
        'string': `text('${name}')`,
        'boolean': `integer('${name}', { mode: 'boolean' })`,
        'number': `integer('${name}')`,
        'date': `integer('${name}', { mode: 'timestamp_ms' })`,
        'number[]': `integer('${name}').array()`,
        'string[]': `text('${name}').array()`,
        'json': `text('${name}')`,
      } as const
      return typeMap[type]
    }

    let id: string = ''

    if (options.advanced?.database?.useNumberId) {
      id = `integer("id", { mode: "number" }).primaryKey({ autoIncrement: true })`
    }
    else {
      id = `text('id').primaryKey()`
    }

    const schema = `export const ${modelName} = sqliteTable("${convertToSnakeCase(
      modelName,
      adapter.options?.camelCase,
    )}", {
      id: ${id},
      ${Object.keys(fields)
        .map((field) => {
          const attr = fields[field]!
          const fieldName = attr.fieldName || field
          let type = getType(fieldName, attr)

          if (
            attr.defaultValue !== null
            && typeof attr.defaultValue !== 'undefined'
          ) {
            if (typeof attr.defaultValue === 'function') {
              if (
                attr.type === 'date'
                && attr.defaultValue.toString().includes('new Date()')
              ) {
                type += `.default(sql\`(cast(unixepoch('subsecond') * 1000 as integer))\`)`
              }
              else {
                // we are intentionally not adding .$defaultFn(${attr.defaultValue})
                // this is because if the defaultValue is a function, it could have
                // custom logic within that function that might not work in drizzle's context.
              }
            }
            else if (typeof attr.defaultValue === 'string') {
              type += `.default("${attr.defaultValue}")`
            }
            else {
              type += `.default(${attr.defaultValue})`
            }
          }
          // Add .$onUpdate() for fields with onUpdate property
          if (attr.onUpdate && attr.type === 'date') {
            if (typeof attr.onUpdate === 'function') {
              type += `.$onUpdate(${attr.onUpdate})`
            }
          }

          return `${fieldName}: ${type}${attr.required ? '.notNull()' : ''}${
            attr.unique ? '.unique()' : ''
          }${
            attr.references
              ? `.references(()=> ${getModelName(
                tables[attr.references.model]?.modelName
                || attr.references.model,
                adapter.options,
              )}.${fields[attr.references.field]?.fieldName || attr.references.field}, { onDelete: '${
                attr.references.onDelete || 'cascade'
              }' })`
              : ''
          }`
        })
        .join(',\n ')}
    });`
    code += `\n${schema}\n`
  }

  try {
    const eslint = new ESLint({
      fix: true,
    })

    const results = await eslint.lintText(code)

    code = results[0]?.output || code
  }
  catch (error) {
    console.warn('代码格式化失败，使用原始代码:', error)
  }
  return {
    code,
    fileName: filePath,
    overwrite: fileExist,
  }
}

function generateImport(tables: BetterAuthDBSchema) {
  const rootImports: string[] = []
  const coreImports: string[] = []

  coreImports.push('sqliteTable')
  coreImports.push('text')
  coreImports.push('integer')

  // Add sql import for SQLite timestamps with defaultNow
  const hasSQLiteTimestamp = Object.values(tables).some(table =>
    Object.values(table.fields).some(
      field =>
        field.type === 'date'
        && field.defaultValue
        && typeof field.defaultValue === 'function'
        && field.defaultValue.toString().includes('new Date()'),
    ),
  )

  if (hasSQLiteTimestamp) {
    rootImports.push('sql')
  }

  return `${rootImports.length > 0 ? `import { ${rootImports.join(', ')} } from "drizzle-orm";\n` : ''}import { ${coreImports
    .map(x => x.trim())
    .filter(x => x !== '')
    .join(', ')} } from "drizzle-orm/sqlite-core";\n`
}

function getModelName(
  modelName: string,
  options: Record<string, any> | undefined,
) {
  return options?.usePlural ? `${modelName}s` : modelName
}

/**
 * Generates the complete database structure from Better Auth configuration
 * Outputs the schema as formatted JSON showing all tables, fields, and relationships
 */
async function generateAuthSchema() {
  // Mock database instance - Better Auth only needs this for type checking, not actual queries
  const mockDb = {} as Record<string, unknown>
  const filePath = path.resolve(__dirname, '../database/auth-schema.ts')

  console.log('Generating auth schema to:', filePath)

  const { code, fileName, overwrite } = await generateDrizzleSchema({
    options: baseServerOptions,
    file: filePath,
    adapter: drizzleAdapter(mockDb, {
      provider: 'sqlite',
    }),
  })

  if (overwrite) {
    writeFileSync(fileName, code)
  }
  else {
    writeFileSync(fileName, code, { flag: 'wx' })
  }
}

// Main execution
async function main() {
  try {
    await generateAuthSchema()
  }
  catch (error) {
    console.error('Error generating auth schema:', error)
    process.exit(1)
  }
}

main()
