/**
 * One-off migration: split guests.address into street/city/province/country.
 *
 * Safe to run multiple times (uses IF NOT EXISTS / IF EXISTS).
 * Preserves all existing guest rows. The old `address` value is copied into
 * `city` as a best-effort migration, since most existing addresses were
 * already just city names ("Cebu City", "Manila", etc).
 *
 * Usage on Railway:
 *   1. Push this file to GitHub (auto-deploys to Railway)
 *   2. Railway dashboard → your service → "..." menu → "Run Command"
 *   3. Enter: npm run migrate-address
 *   4. Watch logs for "Migration complete"
 */

// Railway injects DATABASE_URL natively; no dotenv needed.
const { pool } = require("./db");

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Starting address-split migration...");
    await client.query("BEGIN");

    // 1. Add the four new columns if they don't already exist
    await client.query(`
      ALTER TABLE guests
        ADD COLUMN IF NOT EXISTS street   VARCHAR(100),
        ADD COLUMN IF NOT EXISTS city     VARCHAR(50),
        ADD COLUMN IF NOT EXISTS province VARCHAR(50),
        ADD COLUMN IF NOT EXISTS country  VARCHAR(50)
    `);
    console.log("  + street, city, province, country columns added (or already existed)");

    // 2. Check whether the old `address` column still exists
    const addressCol = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'guests' AND column_name = 'address'
    `);

    if (addressCol.rows.length > 0) {
      // 3. Copy old address values into `city` for rows where city is still null.
      //    The old seed used city-only values, so this is a reasonable mapping.
      const result = await client.query(`
        UPDATE guests
        SET city = address
        WHERE city IS NULL AND address IS NOT NULL
      `);
      console.log(`  + copied ${result.rowCount} address value(s) into city column`);

      // 4. Drop the old address column
      await client.query("ALTER TABLE guests DROP COLUMN address");
      console.log("  + dropped legacy address column");
    } else {
      console.log("  ~ legacy address column not found (already migrated)");
    }

    await client.query("COMMIT");

    // Quick sanity check
    const sample = await client.query("SELECT guest_id, first_name, last_name, street, city, province, country FROM guests ORDER BY guest_id LIMIT 5");
    console.log("\nSample rows after migration:");
    console.table(sample.rows);

    console.log("\nMigration complete. All guest data preserved.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed, rolled back:", err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
