import db from '@adonisjs/lucid/services/db'

/**
 * Truncate all tables except AdonisJS system tables
 * to ensure a clean state for tests
 */
export async function truncateTablesExceptAdonis() {
  // Get all table names
  const tables = await db.rawQuery(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE 'adonis_%'"
  )

  // Disable foreign key checks temporarily
  await db.rawQuery('SET session_replication_role = replica;')

  try {
    // Truncate each table
    for (const table of tables.rows) {
      await db.rawQuery(`TRUNCATE TABLE "${table.tablename}" RESTART IDENTITY CASCADE;`)
    }
  } finally {
    // Re-enable foreign key checks
    await db.rawQuery('SET session_replication_role = DEFAULT;')
  }
}
