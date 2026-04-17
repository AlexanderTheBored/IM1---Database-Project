const express = require("express");
const cors = require("cors");
const path = require("path");
const { pool, initializeSchema } = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve React build in production
app.use(express.static(path.join(__dirname, "..", "client", "build")));

// ════════════════════════════════════════════════
//  ROOM TYPES
// ════════════════════════════════════════════════
app.get("/api/room-types", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM room_types ORDER BY type_id");
  res.json(rows);
});

app.get("/api/room-types/:id", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM room_types WHERE type_id = $1", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Room type not found" });
  res.json(rows[0]);
});

app.post("/api/room-types", async (req, res) => {
  const { type_name, description, nightly_rate, max_occupancy } = req.body;
  if (!type_name || !nightly_rate) return res.status(400).json({ error: "type_name and nightly_rate are required" });
  const { rows } = await pool.query(
    "INSERT INTO room_types (type_name, description, nightly_rate, max_occupancy) VALUES ($1, $2, $3, $4) RETURNING *",
    [type_name, description || null, nightly_rate, max_occupancy || 1]
  );
  res.status(201).json(rows[0]);
});

app.put("/api/room-types/:id", async (req, res) => {
  const { type_name, description, nightly_rate, max_occupancy } = req.body;
  const { rows } = await pool.query(
    `UPDATE room_types SET
      type_name = COALESCE($1, type_name),
      description = COALESCE($2, description),
      nightly_rate = COALESCE($3, nightly_rate),
      max_occupancy = COALESCE($4, max_occupancy)
    WHERE type_id = $5 RETURNING *`,
    [type_name, description, nightly_rate, max_occupancy, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: "Room type not found" });
  res.json(rows[0]);
});

app.delete("/api/room-types/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM room_types WHERE type_id = $1", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(400).json({ error: "Cannot delete — rooms still reference this type" });
  }
});

// ════════════════════════════════════════════════
//  ROOMS
// ════════════════════════════════════════════════
app.get("/api/rooms", async (req, res) => {
  const { rows } = await pool.query(`
    SELECT r.*, rt.type_name, rt.nightly_rate, rt.max_occupancy
    FROM rooms r
    JOIN room_types rt ON r.type_id = rt.type_id
    ORDER BY r.room_number
  `);
  res.json(rows);
});

app.get("/api/rooms/:id", async (req, res) => {
  const { rows } = await pool.query(`
    SELECT r.*, rt.type_name, rt.nightly_rate
    FROM rooms r JOIN room_types rt ON r.type_id = rt.type_id
    WHERE r.room_id = $1
  `, [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Room not found" });
  res.json(rows[0]);
});

app.post("/api/rooms", async (req, res) => {
  const { room_number, type_id, floor } = req.body;
  if (!room_number || !type_id) return res.status(400).json({ error: "room_number and type_id are required" });
  try {
    const { rows } = await pool.query(
      "INSERT INTO rooms (room_number, type_id, floor) VALUES ($1, $2, $3) RETURNING *",
      [room_number, type_id, floor || 1]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(400).json({ error: "Room number already exists" });
  }
});

app.put("/api/rooms/:id", async (req, res) => {
  const { room_number, type_id, floor, status } = req.body;
  const { rows } = await pool.query(
    `UPDATE rooms SET
      room_number = COALESCE($1, room_number),
      type_id = COALESCE($2, type_id),
      floor = COALESCE($3, floor),
      status = COALESCE($4, status)
    WHERE room_id = $5 RETURNING *`,
    [room_number, type_id, floor, status, req.params.id]
  );
  res.json(rows[0]);
});

app.delete("/api/rooms/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM rooms WHERE room_id = $1", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(400).json({ error: "Cannot delete — reservations exist for this room" });
  }
});

// ════════════════════════════════════════════════
//  GUESTS
// ════════════════════════════════════════════════
app.get("/api/guests", async (req, res) => {
  const { search } = req.query;
  let result;
  if (search) {
    result = await pool.query(
      "SELECT * FROM guests WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1 ORDER BY last_name",
      [`%${search}%`]
    );
  } else {
    result = await pool.query("SELECT * FROM guests ORDER BY last_name");
  }
  res.json(result.rows);
});

app.get("/api/guests/:id", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM guests WHERE guest_id = $1", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Guest not found" });
  res.json(rows[0]);
});

app.post("/api/guests", async (req, res) => {
  const { first_name, last_name, email, phone, address } = req.body;
  if (!first_name || !last_name) return res.status(400).json({ error: "first_name and last_name are required" });
  try {
    const { rows } = await pool.query(
      "INSERT INTO guests (first_name, last_name, email, phone, address) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [first_name, last_name, email || null, phone || null, address || null]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(400).json({ error: "Email already registered" });
  }
});

app.put("/api/guests/:id", async (req, res) => {
  const { first_name, last_name, email, phone, address } = req.body;
  const { rows } = await pool.query(
    `UPDATE guests SET
      first_name = COALESCE($1, first_name),
      last_name = COALESCE($2, last_name),
      email = COALESCE($3, email),
      phone = COALESCE($4, phone),
      address = COALESCE($5, address)
    WHERE guest_id = $6 RETURNING *`,
    [first_name, last_name, email, phone, address, req.params.id]
  );
  res.json(rows[0]);
});

app.delete("/api/guests/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM guests WHERE guest_id = $1", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(400).json({ error: "Cannot delete — guest has reservations" });
  }
});

// ════════════════════════════════════════════════
//  RESERVATIONS
// ════════════════════════════════════════════════
app.get("/api/reservations", async (req, res) => {
  const { status } = req.query;
  let query = `
    SELECT res.*,
           g.first_name, g.last_name, g.email AS guest_email, g.phone AS guest_phone,
           r.room_number, r.floor,
           rt.type_name, rt.nightly_rate
    FROM reservations res
    JOIN guests g ON res.guest_id = g.guest_id
    JOIN rooms r ON res.room_id = r.room_id
    JOIN room_types rt ON r.type_id = rt.type_id
  `;
  const params = [];
  if (status) {
    query += " WHERE res.status = $1";
    params.push(status);
  }
  query += " ORDER BY res.check_in_date DESC";
  const { rows } = await pool.query(query, params);
  res.json(rows);
});

app.get("/api/reservations/:id", async (req, res) => {
  const { rows } = await pool.query(`
    SELECT res.*,
           g.first_name, g.last_name, g.email AS guest_email, g.phone AS guest_phone,
           r.room_number, r.floor,
           rt.type_name, rt.nightly_rate
    FROM reservations res
    JOIN guests g ON res.guest_id = g.guest_id
    JOIN rooms r ON res.room_id = r.room_id
    JOIN room_types rt ON r.type_id = rt.type_id
    WHERE res.reservation_id = $1
  `, [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Reservation not found" });
  res.json(rows[0]);
});

app.post("/api/reservations", async (req, res) => {
  const { guest_id, room_id, check_in_date, check_out_date, total_amount } = req.body;
  if (!guest_id || !room_id || !check_in_date || !check_out_date) {
    return res.status(400).json({ error: "guest_id, room_id, check_in_date, and check_out_date are required" });
  }
  // Check for room conflict
  const conflict = await pool.query(`
    SELECT reservation_id FROM reservations
    WHERE room_id = $1 AND status IN ('confirmed', 'checked_in')
      AND check_in_date < $2 AND check_out_date > $3
  `, [room_id, check_out_date, check_in_date]);
  if (conflict.rows.length) return res.status(409).json({ error: "Room is already booked for these dates" });

  const { rows } = await pool.query(
    "INSERT INTO reservations (guest_id, room_id, check_in_date, check_out_date, status, total_amount) VALUES ($1, $2, $3, $4, 'confirmed', $5) RETURNING *",
    [guest_id, room_id, check_in_date, check_out_date, total_amount || null]
  );
  res.status(201).json(rows[0]);
});

app.patch("/api/reservations/:id/status", async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["confirmed", "checked_in", "checked_out", "cancelled"];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: "Invalid status" });

  const reservation = await pool.query("SELECT * FROM reservations WHERE reservation_id = $1", [req.params.id]);
  if (!reservation.rows.length) return res.status(404).json({ error: "Reservation not found" });
  const resData = reservation.rows[0];

  // Update room status based on reservation status
  if (status === "checked_in") {
    await pool.query("UPDATE rooms SET status = 'occupied' WHERE room_id = $1", [resData.room_id]);
  } else if (status === "checked_out" || status === "cancelled") {
    await pool.query("UPDATE rooms SET status = 'available' WHERE room_id = $1", [resData.room_id]);
  }

  const { rows } = await pool.query(
    "UPDATE reservations SET status = $1 WHERE reservation_id = $2 RETURNING *",
    [status, req.params.id]
  );
  res.json(rows[0]);
});

app.delete("/api/reservations/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM reservations WHERE reservation_id = $1", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(400).json({ error: "Cannot delete — payments exist for this reservation" });
  }
});

// ════════════════════════════════════════════════
//  PAYMENTS
// ════════════════════════════════════════════════
app.get("/api/payments", async (req, res) => {
  const { reservation_id } = req.query;
  let query = `
    SELECT p.*,
           g.first_name, g.last_name,
           r.room_number
    FROM payments p
    JOIN reservations res ON p.reservation_id = res.reservation_id
    JOIN guests g ON res.guest_id = g.guest_id
    JOIN rooms r ON res.room_id = r.room_id
  `;
  const params = [];
  if (reservation_id) {
    query += " WHERE p.reservation_id = $1";
    params.push(reservation_id);
  }
  query += " ORDER BY p.payment_date DESC";
  const { rows } = await pool.query(query, params);
  res.json(rows);
});

app.post("/api/payments", async (req, res) => {
  const { reservation_id, amount, payment_type, payment_method, payment_date } = req.body;
  if (!reservation_id || !amount) return res.status(400).json({ error: "reservation_id and amount are required" });
  const { rows } = await pool.query(
    "INSERT INTO payments (reservation_id, amount, payment_type, payment_method, payment_date) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [reservation_id, amount, payment_type || "full", payment_method || "cash", payment_date || new Date().toISOString().slice(0, 10)]
  );
  res.status(201).json(rows[0]);
});

app.delete("/api/payments/:id", async (req, res) => {
  await pool.query("DELETE FROM payments WHERE payment_id = $1", [req.params.id]);
  res.json({ message: "Deleted" });
});

// ════════════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════════════
app.get("/api/dashboard", async (req, res) => {
  const [totalR, occR, availR, activeR, revR, recentR] = await Promise.all([
    pool.query("SELECT COUNT(*) as count FROM rooms"),
    pool.query("SELECT COUNT(*) as count FROM rooms WHERE status = 'occupied'"),
    pool.query("SELECT COUNT(*) as count FROM rooms WHERE status = 'available'"),
    pool.query("SELECT COUNT(*) as count FROM reservations WHERE status = 'checked_in'"),
    pool.query("SELECT COALESCE(SUM(amount), 0) as total FROM payments"),
    pool.query(`
      SELECT res.*, g.first_name, g.last_name, r.room_number, rt.type_name
      FROM reservations res
      JOIN guests g ON res.guest_id = g.guest_id
      JOIN rooms r ON res.room_id = r.room_id
      JOIN room_types rt ON r.type_id = rt.type_id
      ORDER BY res.created_at DESC LIMIT 5
    `),
  ]);
  res.json({
    totalRooms: parseInt(totalR.rows[0].count),
    occupied: parseInt(occR.rows[0].count),
    available: parseInt(availR.rows[0].count),
    activeGuests: parseInt(activeR.rows[0].count),
    totalRevenue: parseFloat(revR.rows[0].total),
    recentReservations: recentR.rows,
  });
});

// ── Catch-all: serve React app for any non-API route ──
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "build", "index.html"));
});

// ── Start ──
async function start() {
  try {
    await initializeSchema();
    app.listen(PORT, () => {
      console.log(`\n🏨 Hotel Reservation System running at http://localhost:${PORT}\n`);
    });
  } catch (err) {
    console.error("❌ Failed to start:", err.message);
    process.exit(1);
  }
}

start();
