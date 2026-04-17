-- ============================================================
-- HOTEL ROOM RESERVATION DATABASE
-- IM1 Part 2 — SQL Schema with Seed Data
-- ============================================================
-- 5 Core Tables:
--   1. room_types    – room categories & nightly rates
--   2. rooms         – physical rooms linked to a type
--   3. guests        – guest personal details
--   4. reservations  – bookings linking guest ↔ room + dates
--   5. payments      – financial transactions per reservation
-- ============================================================

DROP DATABASE IF EXISTS hotel_reservation_db;
CREATE DATABASE hotel_reservation_db;
USE hotel_reservation_db;


-- ────────────────────────────────────────────────────────────
-- TABLE 1: room_types
-- Defines categories (Single, Double, etc.) and nightly rates
-- ────────────────────────────────────────────────────────────
CREATE TABLE room_types (
    type_id       INT            AUTO_INCREMENT PRIMARY KEY,
    type_name     VARCHAR(50)    NOT NULL,
    description   VARCHAR(255),
    nightly_rate  DECIMAL(10,2)  NOT NULL,
    max_occupancy INT            NOT NULL DEFAULT 1,
    created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
);


-- ────────────────────────────────────────────────────────────
-- TABLE 2: rooms
-- Master list of physical rooms in the hotel
-- ────────────────────────────────────────────────────────────
CREATE TABLE rooms (
    room_id   INT          AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(10) NOT NULL UNIQUE,
    type_id   INT          NOT NULL,
    floor     INT          NOT NULL DEFAULT 1,
    status    ENUM('available', 'occupied', 'maintenance')
                           NOT NULL DEFAULT 'available',
    created_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (type_id) REFERENCES room_types(type_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);


-- ────────────────────────────────────────────────────────────
-- TABLE 3: guests
-- Registry of all guests who have booked or stayed
-- ────────────────────────────────────────────────────────────
CREATE TABLE guests (
    guest_id    INT            AUTO_INCREMENT PRIMARY KEY,
    first_name  VARCHAR(50)    NOT NULL,
    last_name   VARCHAR(50)    NOT NULL,
    email       VARCHAR(100)   UNIQUE,
    phone       VARCHAR(20),
    address     VARCHAR(255),
    created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
);


-- ────────────────────────────────────────────────────────────
-- TABLE 4: reservations
-- Links a guest to a room with check-in/out dates
-- ────────────────────────────────────────────────────────────
CREATE TABLE reservations (
    reservation_id  INT       AUTO_INCREMENT PRIMARY KEY,
    guest_id        INT       NOT NULL,
    room_id         INT       NOT NULL,
    check_in_date   DATE      NOT NULL,
    check_out_date  DATE      NOT NULL,
    status          ENUM('confirmed', 'checked_in', 'checked_out', 'cancelled')
                              NOT NULL DEFAULT 'confirmed',
    total_amount    DECIMAL(10,2),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (guest_id) REFERENCES guests(guest_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    -- Ensure check-out is after check-in
    CHECK (check_out_date > check_in_date)
);


-- ────────────────────────────────────────────────────────────
-- TABLE 5: payments
-- Tracks deposits, partial payments, and final balances
-- ────────────────────────────────────────────────────────────
CREATE TABLE payments (
    payment_id      INT            AUTO_INCREMENT PRIMARY KEY,
    reservation_id  INT            NOT NULL,
    amount          DECIMAL(10,2)  NOT NULL,
    payment_type    ENUM('deposit', 'partial', 'full', 'refund')
                                   NOT NULL DEFAULT 'full',
    payment_method  ENUM('cash', 'card', 'bank_transfer', 'gcash')
                                   NOT NULL DEFAULT 'cash',
    payment_date    DATE           NOT NULL,
    created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);


-- ============================================================
-- SEED DATA
-- ============================================================

-- Room Types
INSERT INTO room_types (type_name, description, nightly_rate, max_occupancy) VALUES
('Single',          'Cozy room with one single bed',                     2500.00, 1),
('Double',          'Spacious room with a double bed',                   3800.00, 2),
('Deluxe',          'Premium room with king bed and city view',          5500.00, 2),
('Executive Suite', 'Luxury suite with living area and private balcony', 9000.00, 4);

-- Rooms
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
('402', 4, 4, 'available');

-- Guests
INSERT INTO guests (first_name, last_name, email, phone, address) VALUES
('Maria',    'Santos',      'maria.santos@email.com',    '0917-111-2233', 'Cebu City'),
('Juan',     'Dela Cruz',   'juan.delacruz@email.com',   '0918-444-5566', 'Manila'),
('Ana',      'Reyes',       'ana.reyes@email.com',       '0919-777-8899', 'Davao City'),
('Carlos',   'Garcia',      'carlos.garcia@email.com',   '0920-222-3344', 'Quezon City'),
('Patricia', 'Villanueva',  'pat.villanueva@email.com',  '0921-555-6677', 'Cebu City');

-- Reservations
INSERT INTO reservations (guest_id, room_id, check_in_date, check_out_date, status, total_amount) VALUES
(1, 5, '2026-04-14', '2026-04-17', 'checked_in',   11400.00),   -- 3 nights × ₱3,800
(2, 8, '2026-04-15', '2026-04-18', 'checked_in',   16500.00),   -- 3 nights × ₱5,500
(3, 9, '2026-04-20', '2026-04-23', 'confirmed',    27000.00),   -- 3 nights × ₱9,000
(4, 1, '2026-04-10', '2026-04-12', 'checked_out',   5000.00),   -- 2 nights × ₱2,500
(5, 3, '2026-04-22', '2026-04-24', 'confirmed',     5000.00);   -- 2 nights × ₱2,500

-- Payments
INSERT INTO payments (reservation_id, amount, payment_type, payment_method, payment_date) VALUES
(1, 3800.00,  'deposit', 'cash',          '2026-04-14'),
(1, 7600.00,  'partial', 'gcash',         '2026-04-16'),
(2, 5500.00,  'deposit', 'card',          '2026-04-15'),
(3, 9000.00,  'deposit', 'bank_transfer', '2026-04-17'),
(4, 5000.00,  'full',    'cash',          '2026-04-12'),
(5, 2500.00,  'deposit', 'gcash',         '2026-04-18');


-- ============================================================
-- USEFUL QUERIES (for testing / demo)
-- ============================================================

-- View all rooms with their type and rate
SELECT r.room_number, r.floor, r.status,
       rt.type_name, rt.nightly_rate
FROM rooms r
JOIN room_types rt ON r.type_id = rt.type_id
ORDER BY r.room_number;

-- View all current reservations with guest and room info
SELECT res.reservation_id,
       CONCAT(g.first_name, ' ', g.last_name) AS guest_name,
       r.room_number,
       rt.type_name,
       res.check_in_date,
       res.check_out_date,
       res.status,
       res.total_amount
FROM reservations res
JOIN guests g ON res.guest_id = g.guest_id
JOIN rooms r ON res.room_id = r.room_id
JOIN room_types rt ON r.type_id = rt.type_id
ORDER BY res.check_in_date;

-- Payment summary per reservation
SELECT res.reservation_id,
       CONCAT(g.first_name, ' ', g.last_name) AS guest_name,
       res.total_amount,
       COALESCE(SUM(p.amount), 0) AS total_paid,
       res.total_amount - COALESCE(SUM(p.amount), 0) AS balance
FROM reservations res
JOIN guests g ON res.guest_id = g.guest_id
LEFT JOIN payments p ON res.reservation_id = p.reservation_id
GROUP BY res.reservation_id, g.first_name, g.last_name, res.total_amount;

-- Check available rooms for a given date range
SELECT r.room_number, rt.type_name, rt.nightly_rate
FROM rooms r
JOIN room_types rt ON r.type_id = rt.type_id
WHERE r.room_id NOT IN (
    SELECT room_id FROM reservations
    WHERE status IN ('confirmed', 'checked_in')
      AND check_in_date < '2026-04-23'
      AND check_out_date > '2026-04-20'
)
ORDER BY rt.nightly_rate;
