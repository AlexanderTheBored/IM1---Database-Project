const { Pool, types } = require("pg");

// Return dates as clean "YYYY-MM-DD" strings, not JS Date objects
types.setTypeParser(1082, (val) => val);           // DATE
types.setTypeParser(1114, (val) => val);           // TIMESTAMP
types.setTypeParser(1184, (val) => val);           // TIMESTAMPTZ
// Return NUMERIC as numbers, not strings
types.setTypeParser(1700, (val) => parseFloat(val));

// Railway auto-injects DATABASE_URL when you add a PostgreSQL service
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("railway")
    ? { rejectUnauthorized: false }
    : false,
});

async function initializeSchema() {
  const client = await pool.connect();
  try {
    await client.query(`

      -- ═══════════════════════════════════════════════
      -- TABLE 1: room_types
      -- ═══════════════════════════════════════════════
      CREATE TABLE IF NOT EXISTS room_types (
        type_id       SERIAL PRIMARY KEY,
        type_name     VARCHAR(50) NOT NULL,
        description   VARCHAR(255),
        nightly_rate  NUMERIC(10,2) NOT NULL,
        max_occupancy INTEGER NOT NULL DEFAULT 1,
        created_at    TIMESTAMP DEFAULT NOW()
      );

      -- ═══════════════════════════════════════════════
      -- TABLE 2: rooms
      -- ═══════════════════════════════════════════════
      CREATE TABLE IF NOT EXISTS rooms (
        room_id     SERIAL PRIMARY KEY,
        room_number VARCHAR(10) NOT NULL UNIQUE,
        type_id     INTEGER NOT NULL REFERENCES room_types(type_id)
                    ON UPDATE CASCADE ON DELETE RESTRICT,
        floor       INTEGER NOT NULL DEFAULT 1,
        status      VARCHAR(20) NOT NULL DEFAULT 'available'
                    CHECK (status IN ('available', 'occupied', 'maintenance')),
        created_at  TIMESTAMP DEFAULT NOW()
      );

      -- ═══════════════════════════════════════════════
      -- TABLE 3: guests
      -- ═══════════════════════════════════════════════
      CREATE TABLE IF NOT EXISTS guests (
        guest_id   SERIAL PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name  VARCHAR(50) NOT NULL,
        email      VARCHAR(100) UNIQUE,
        phone      VARCHAR(20),
        address    VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- ═══════════════════════════════════════════════
      -- TABLE 4: reservations
      -- ═══════════════════════════════════════════════
      CREATE TABLE IF NOT EXISTS reservations (
        reservation_id SERIAL PRIMARY KEY,
        guest_id       INTEGER NOT NULL REFERENCES guests(guest_id)
                       ON UPDATE CASCADE ON DELETE RESTRICT,
        room_id        INTEGER NOT NULL REFERENCES rooms(room_id)
                       ON UPDATE CASCADE ON DELETE RESTRICT,
        check_in_date  DATE NOT NULL,
        check_out_date DATE NOT NULL,
        status         VARCHAR(20) NOT NULL DEFAULT 'confirmed'
                       CHECK (status IN ('confirmed', 'checked_in', 'checked_out', 'cancelled')),
        total_amount   NUMERIC(10,2),
        created_at     TIMESTAMP DEFAULT NOW(),
        CHECK (check_out_date > check_in_date)
      );

      -- ═══════════════════════════════════════════════
      -- TABLE 5: payments
      -- ═══════════════════════════════════════════════
      CREATE TABLE IF NOT EXISTS payments (
        payment_id     SERIAL PRIMARY KEY,
        reservation_id INTEGER NOT NULL REFERENCES reservations(reservation_id)
                       ON UPDATE CASCADE ON DELETE RESTRICT,
        amount         NUMERIC(10,2) NOT NULL,
        payment_type   VARCHAR(20) NOT NULL DEFAULT 'full'
                       CHECK (payment_type IN ('deposit', 'partial', 'full', 'refund')),
        payment_method VARCHAR(20) NOT NULL DEFAULT 'cash'
                       CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'gcash')),
        payment_date   DATE NOT NULL,
        created_at     TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Database schema initialized");
  } finally {
    client.release();
  }
}

module.exports = { pool, initializeSchema };
