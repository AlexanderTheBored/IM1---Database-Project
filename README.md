# AIKE — A Web-Based Automated Integrated Key Experience for Hotel Reservations and Guest Management

A full-stack hotel reservation and guest management system built with **Node.js**, **Express**, **PostgreSQL**, and **React**.

**AIKE** stands for **Automated Integrated Key Engine** — a centralized platform for room inventory, reservation lifecycle, and guest financial tracking.

> IM1 Part 2 — Database Project

**Live URL:** `https://YOUR-PROJECT.up.railway.app`

---

## Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Backend  | Node.js + Express       |
| Database | PostgreSQL (Railway)    |
| Frontend | React                   |
| Hosting  | Railway                 |
| API      | REST                    |

## Database Schema (5 Core Tables)

```
room_types ──┐
             │ type_id (FK)
rooms ───────┘
  ↑
  │ room_id (FK)
reservations ──── guests (guest_id FK)
  ↑
  │ reservation_id (FK)
payments
```

- **room_types** — Room categories (Single, Double, Deluxe, Executive Suite) and nightly rates
- **rooms** — Physical rooms with room number, floor, and availability status
- **guests** — Guest registry with name, email, phone, address
- **reservations** — Bookings linking a guest to a room with check-in/out dates and status
- **payments** — Financial transactions (deposits, partial, full, refunds) per reservation
- **users** — Login accounts with roles (`admin`, `employee`, `customer`); customers link to a guest record

---

## Logins

Go to `/login` (no link on the public site). Default staff accounts are created automatically on first server start:

| Role     | Username   | Default Password | Access                                              |
|----------|------------|------------------|-----------------------------------------------------|
| Admin    | `admin`    | `admin123`       | Full admin panel: dashboard, rooms, room types, everything |
| Employee | `employee` | `employee123`    | Front desk: reservations, guests, payments          |
| Customer | (register) | —                | Books rooms, sees own bookings under "My Bookings"  |

Customers can register themselves from the login page. Booking without an account still works (guest checkout).
Override the default staff passwords with the `ADMIN_PASSWORD` / `EMPLOYEE_PASSWORD` environment variables, and set `JWT_SECRET` in production.

---

## Deploy to Railway (Live on the Internet)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/hotel-reservation-system.git
git push -u origin main
```

### Step 2: Set up Railway
1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub Repo"**
3. Select your `hotel-reservation-system` repo
4. Railway will auto-detect Node.js and start building

### Step 3: Add PostgreSQL Database
1. In your Railway project, click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway automatically creates a `DATABASE_URL` variable and injects it into your app
3. That's it — no manual config needed

### Step 4: Seed the Database
1. In Railway, go to your app service → **"Settings"** → **"Networking"** → enable **"Public Networking"** (to get a URL)
2. Go to the **"Variables"** tab and confirm `DATABASE_URL` is set
3. Open the **Railway CLI** or the **"Deploy"** tab shell:
```bash
npm run seed
```
Or: Go to your service → click the three dots → **"Run Command"** → type `npm run seed`

### Step 5: Open Your App
Railway gives you a public URL like:
```
https://hotel-reservation-system-production.up.railway.app
```
Share this URL with your group and instructor!

---

## Run Locally (for development)

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- A PostgreSQL database (local or cloud)

### Setup
```bash
git clone https://github.com/YOUR-USERNAME/hotel-reservation-system.git
cd hotel-reservation-system

# Set your database URL
# On Mac/Linux:
export DATABASE_URL=postgresql://username:password@localhost:5432/hotel_db

# On Windows CMD:
set DATABASE_URL=postgresql://username:password@localhost:5432/hotel_db

# Install everything
npm run install-all

# Seed the database
npm run seed

# Start both backend and frontend
npm run dev
```

Opens at `http://localhost:3000` (frontend) + `http://localhost:5000` (API)

---

## API Endpoints

Protected endpoints need an `Authorization: Bearer <token>` header (token comes from login/register).

| Method | Endpoint                           | Description                                  | Access         |
|--------|-------------------------------------|----------------------------------------------|----------------|
| POST   | `/api/auth/register`               | Create a customer account (+ guest record)   | Public         |
| POST   | `/api/auth/login`                  | Log in, returns JWT token + role             | Public         |
| GET    | `/api/auth/me`                     | Current logged-in user                       | Logged in      |
| GET    | `/api/room-types`                  | List all room types                          | Public         |
| POST/PUT/DELETE | `/api/room-types...`      | Manage room types                            | Admin          |
| GET    | `/api/rooms`                       | List all rooms                               | Public         |
| GET    | `/api/rooms/available`             | Rooms of a type free for a date range        | Public         |
| POST/PUT/DELETE | `/api/rooms...`           | Manage rooms                                 | Admin          |
| GET    | `/api/guests`                      | List all guests                              | Staff          |
| POST   | `/api/guests`                      | Register a guest (reuses record if email exists) | Public     |
| PUT    | `/api/guests/:id`                  | Edit a guest                                 | Staff          |
| DELETE | `/api/guests/:id`                  | Delete a guest                               | Admin          |
| GET    | `/api/reservations`                | List all reservations                        | Staff          |
| GET    | `/api/my-reservations`             | Logged-in customer's own bookings            | Logged in      |
| POST   | `/api/reservations`                | Create a reservation — pass `type_id` to auto-assign a room free for the dates, or `room_id` for a specific room | Public |
| PATCH  | `/api/reservations/:id/status`     | Check-in / Check-out / Cancel                | Staff          |
| DELETE | `/api/reservations/:id`            | Delete a reservation                         | Admin          |
| GET/POST/DELETE | `/api/payments...`        | List / record / delete payments              | Staff          |
| GET    | `/api/dashboard`                   | Dashboard stats (incl. revenue)              | Admin          |

*Staff = admin or employee.*

---

## Booking & Availability Behavior

- Room cards on the public site show **"X of Y available"**, where Y is the type's fixed total and X is how many rooms are free for the selected dates (today → tomorrow until you search). Bookings lower X for the dates they cover; the max Y never shrinks, and X recovers when a reservation is cancelled or checked out.
- Availability is enforced **by date**: when a guest books, the server assigns the first room of that type with no overlapping `confirmed`/`checked_in` reservation for the chosen dates (rooms under maintenance are skipped). If none is free, the booking is rejected with a clear message.
- Logged-in customers skip the guest-details form — their account is already linked to a guest record — and can view their bookings via **My Bookings**.

---

## Group Members

| Name | Task |
|------|------|
|      |      |
|      |      |
|      |      |

---

## Related Systems

1. **QloApps** — https://qloapps.com
2. **HotelDruid** — https://www.hoteldruid.com
3. **Solidres** — https://www.solidres.com
