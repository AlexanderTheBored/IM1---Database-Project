const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("rlwy.net") || process.env.DATABASE_URL?.includes("railway")
    ? { rejectUnauthorized: false }
    : false,
});

(async () => {
  try {
    console.log("Dropping all tables...");
    await pool.query("DROP TABLE IF EXISTS payments, reservations, guests, rooms, room_types CASCADE");
    console.log("All tables dropped.");
  } catch (err) {
    console.error("Wipe failed:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
