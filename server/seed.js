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
    // Customer accounts point at guests, so clear them too; staff logins survive
    await client.query("DELETE FROM users WHERE role = 'customer'");
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
      ('The Standard Room',     'Classic and urban room. Best for solo and short-term stay.',                  700,   1),
      ('The Superior Room',     'A noticeable upgrade in size and furnishings. Enhanced decor and a small seating area.', 1500,  2),
      ('The Deluxe Room',       'Where luxury begins to feel tangible. Premium floor level and high-end interior design.', 2500,  2),
      ('The Junior Suite',      'Very large single room with a distinct living area separated from the sleeping area.',  4000,  3),
      ('The Presidential Suite','The pinnacle of hotel luxury. Panoramic views, expansive square footage, and impeccable service.', 10000, 4)
    `);

    // ── Rooms ──
    await client.query(`
      INSERT INTO rooms (room_number, type_id, floor, status) VALUES
      ('101', 1, 1, 'available'),
      ('102', 1, 1, 'available'),
      ('103', 1, 1, 'available'),
      ('104', 1, 1, 'available'),
      ('105', 1, 1, 'available'),
      ('106', 1, 1, 'available'),
      ('107', 1, 1, 'available'),
      ('108', 1, 1, 'available'),
      ('109', 1, 1, 'available'),
      ('210', 2, 2, 'available'),
      ('211', 2, 2, 'available'),
      ('212', 2, 2, 'available'),
      ('213', 2, 2, 'available'),
      ('214', 2, 2, 'available'),
      ('315', 3, 3, 'available'),
      ('316', 3, 3, 'available'),
      ('317', 3, 3, 'available'),
      ('318', 4, 3, 'available'),
      ('319', 4, 3, 'available'),
      ('420', 4, 4, 'available'),
      ('421', 4, 4, 'available'),
      ('422', 4, 4, 'available'),
      ('King',  5, 4, 'occupied'),
      ('Queen', 5, 4, 'available')
    `);

    // ── Guests ──
    await client.query(`
      INSERT INTO guests (first_name, last_name, email, phone, street, city, province, country) VALUES
      ('Maria',    'Santos',     'maria.santos@email.com',   '0917-111-2233', '12 Mango Avenue',     'Cebu City',    'Cebu',          'Philippines'),
      ('Juan',     'Dela Cruz',  'juan.delacruz@email.com',  '0918-444-5566', '88 Roxas Boulevard',  'Manila',       'Metro Manila',  'Philippines'),
      ('Ana',      'Reyes',      'ana.reyes@email.com',      '0919-777-8899', '5 Bonifacio Street',  'Davao City',   'Davao del Sur', 'Philippines'),
      ('Carlos',   'Garcia',     'carlos.garcia@email.com',  '0920-222-3344', '23 EDSA',             'Quezon City',  'Metro Manila',  'Philippines'),
      ('Patricia', 'Villanueva', 'pat.villanueva@email.com', '0921-555-6677', '7 Osmeña Boulevard',  'Cebu City',    'Cebu',          'Philippines'),
      ('Aike',     'Dineros',    'aike.dineros@email.com',   '0922-888-9900', '45 Lahug Drive',      'Cebu City',    'Cebu',          'Philippines'),
      ('Bubbles',  'Librado',    'bubbles.librado@email.com','0923-333-4455', '9 Banilad Road',      'Mandaue City', 'Cebu',          'Philippines')
    `);

    // ── Reservations ──
    await client.query(`
      INSERT INTO reservations (guest_id, room_id, check_in_date, check_out_date, status, total_amount) VALUES
      (1, 23, '2026-05-13', '2026-05-15', 'checked_in',  20000),
      (2, 10, '2026-05-14', '2026-05-17', 'checked_in',   4500),
      (3, 15, '2026-05-20', '2026-05-23', 'confirmed',    7500),
      (4,  1, '2026-05-10', '2026-05-12', 'checked_out',  1400),
      (5, 18, '2026-05-22', '2026-05-24', 'confirmed',    8000)
    `);

    // ── Payments ──
    await client.query(`
      INSERT INTO payments (reservation_id, amount, payment_type, payment_method, payment_date) VALUES
      (1, 10000, 'deposit', 'cash',          '2026-05-13'),
      (1, 10000, 'partial', 'gcash',         '2026-05-14'),
      (2, 1500,  'deposit', 'card',          '2026-05-14'),
      (3, 2500,  'deposit', 'bank_transfer', '2026-05-18'),
      (4, 1400,  'full',    'cash',          '2026-05-12'),
      (5, 4000,  'deposit', 'gcash',         '2026-05-20')
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
