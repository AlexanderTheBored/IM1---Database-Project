# 🏨 Hotel Room Reservation System

A full-stack hotel reservation management system built with **Node.js**, **Express**, **PostgreSQL**, and **React**.

> IM1 Part 2 — Database Project

**Live URL:** `https://YOUR-PROJECT.up.railway.app`

---

## 📦 Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Backend  | Node.js + Express       |
| Database | PostgreSQL (Railway)    |
| Frontend | React                   |
| Hosting  | Railway                 |
| API      | REST                    |

## 🗄️ Database Schema (5 Core Tables)

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

---

## 🚀 Deploy to Railway (Live on the Internet)

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

## 💻 Run Locally (for development)

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

## 📡 API Endpoints

| Method | Endpoint                           | Description              |
|--------|-------------------------------------|--------------------------|
| GET    | `/api/dashboard`                   | Dashboard stats          |
| GET    | `/api/room-types`                  | List all room types      |
| POST   | `/api/room-types`                  | Add room type            |
| GET    | `/api/rooms`                       | List all rooms           |
| POST   | `/api/rooms`                       | Add a room               |
| GET    | `/api/guests`                      | List all guests          |
| POST   | `/api/guests`                      | Register a guest         |
| GET    | `/api/reservations`                | List all reservations    |
| POST   | `/api/reservations`                | Create a reservation     |
| PATCH  | `/api/reservations/:id/status`     | Check-in / Check-out     |
| GET    | `/api/payments`                    | List all payments        |
| POST   | `/api/payments`                    | Record a payment         |

---

## 👥 Group Members

| Name | Task |
|------|------|
|      |      |
|      |      |
|      |      |

---

## 📎 Related Systems

1. **QloApps** — https://qloapps.com
2. **HotelDruid** — https://www.hoteldruid.com
3. **Solidres** — https://www.solidres.com
