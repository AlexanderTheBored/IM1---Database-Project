require("dotenv").config();
const { pool, initializeSchema } = require("./db");

async function seed() {
  await initializeSchema();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Clear tables in order (respect foreign keys)
    await client.query("DELETE FROM payments");
    await client.query("DELETE FROM reservations");
    await client.query("DELETE FROM guests");
    await client.query("DELETE FROM rooms");
    await client.query("DELETE FROM room_types");

    // Reset sequences
    await client.query("ALTER SEQUENCE room_types_type_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE rooms_room_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE guests_guest_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE reservations_reservation_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE payments_payment_id_seq RESTART WITH 1");

    // ── Room Types ──
    await client.query(`
      INSERT INTO room_types (type_name, description, nightly_rate, max_occupancy) VALUES
      ('Single',          'Cozy room with one single bed',                     2500, 1),
      ('Double',          'Spacious room with a double bed',                   3800, 2),
      ('Deluxe',          'Premium room with king bed and city view',          5500, 2),
      ('Executive Suite', 'Luxury suite with living area and private balcony', 9000, 4)
    `);

    // ── Rooms ──
    await client.query(`
      INSERT INTO rooms (room_number, type_id, floor, status) VALUES
      ('101', 1, 1, 'available'),
      ('102', 1, 1, 'available'),
      ('103', 1, 1, 'available'),
      ('201', 2, 2, 'available'),
      ('202', 2, 2, 'occupied'),
      ('203', 2, 2, 'available'),
      ('301', 3, 3, 'available'),
      ('302', 3, 3, 'occupied'),
      ('401', 4, 4, 'available'),
      ('402', 4, 4, 'available')
    `);

    // ── Guests ──
    await client.query(`
      INSERT INTO guests (first_name, last_name, email, phone, address) VALUES
      ('Maria',    'Santos',     'maria.santos@email.com',   '0917-111-2233', 'Cebu City'),
      ('Juan',     'Dela Cruz',  'juan.delacruz@email.com',  '0918-444-5566', 'Manila'),
      ('Ana',      'Reyes',      'ana.reyes@email.com',      '0919-777-8899', 'Davao City'),
      ('Carlos',   'Garcia',     'carlos.garcia@email.com',  '0920-222-3344', 'Quezon City'),
      ('Patricia', 'Villanueva', 'pat.villanueva@email.com', '0921-555-6677', 'Cebu City')
    `);

    // ── Reservations ──
    await client.query(`
      INSERT INTO reservations (guest_id, room_id, check_in_date, check_out_date, status, total_amount) VALUES
      (1, 5, '2026-04-14', '2026-04-17', 'checked_in',  11400),
      (2, 8, '2026-04-15', '2026-04-18', 'checked_in',  16500),
      (3, 9, '2026-04-20', '2026-04-23', 'confirmed',   27000),
      (4, 1, '2026-04-10', '2026-04-12', 'checked_out',  5000),
      (5, 3, '2026-04-22', '2026-04-24', 'confirmed',    5000)
    `);

    // ── Payments ──
    await client.query(`
      INSERT INTO payments (reservation_id, amount, payment_type, payment_method, payment_date) VALUES
      (1, 3800,  'deposit', 'cash',          '2026-04-14'),
      (1, 7600,  'partial', 'gcash',         '2026-04-16'),
      (2, 5500,  'deposit', 'card',          '2026-04-15'),
      (3, 9000,  'deposit', 'bank_transfer', '2026-04-17'),
      (4, 5000,  'full',    'cash',          '2026-04-12'),
      (5, 2500,  'deposit', 'gcash',         '2026-04-18')
    `);

    await client.query("COMMIT");
    console.log("✅ Database seeded successfully with sample data!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seed failed:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
