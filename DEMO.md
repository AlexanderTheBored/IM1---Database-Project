# AIKE — Feature Demo Script

> **Before the demo:** reseed the database that morning (`node server/seed.js` with the
> Railway `DATABASE_PUBLIC_URL`, or ask Claude to run it). Seed dates are relative to
> the day you seed, so the dashboard and availability counters will look "live" —
> Bubbles checked in today, Maria checking out tomorrow, Aike arriving in 4 days.
>
> **Logins:** `admin` / `admin123` · `employee` / `employee123` · customer: register live

Total time: ~5 minutes full run. Short spoken summary at the bottom.

---

## Part 1 — Public Booking Site (guest, no login) · ~90s

| Do | Say |
|----|-----|
| Open the site | "This is AIKE, our hotel reservation system. This is what a guest sees — no login needed." |
| Point at the room cards | "Each room type shows **live availability** — '4 of 5 available' means one Junior Suite is taken for tonight. The total never changes; the free count is computed from reservations in the database for the selected dates." |
| Pick dates ~5 days out, click **Search Rooms** | "If I search different dates, the counts recalculate — the Deluxe drops because Ana and Aike have bookings that week. This is a date-overlap query against the reservations table, not a manual status flag." |
| Click **View Details** on a room | "Details show occupancy, availability for my dates, and the total for my stay — nightly rate × nights, calculated automatically." |
| Click **Book Now**, pick dates, **Continue** | "Booking is two steps: dates, then guest details." |
| Fill name + email, **Confirm Booking** | "The system **auto-assigns a free room** — it finds the first room of this type with no conflicting reservation. Here's the confirmation with the room number and total." |
| Close the modal, point at the card | "And the availability count already dropped by one." |

**Feature boxes ticked:** room availability, automatic billing, auto room assignment, guest creation.

## Part 2 — Customer Account · ~45s

| Do | Say |
|----|-----|
| Click **Login** → **Create an account** | "Guests can optionally register an account." |
| Register with a fresh email, or log in with one you made earlier | "Registration creates a login **linked to a guest record** in the database." |
| Book a room again | "Now booking skips the details form — the system already knows who I am." |
| Click **My Bookings** | "And customers can see all their own reservations and statuses." |

**Ticked:** role-based accounts (customer), guest profile linkage, booking history for the guest.

## Part 3 — Employee / Front Desk · ~90s

| Do | Say |
|----|-----|
| Logout → go to `/login` → sign in as `employee` | "Staff log in at a separate URL — there's no admin link on the public site. This is the **employee** role: the front desk." |
| Point at the sidebar | "Employees only get front-desk functions — Reservations, Guests, Payments. No revenue dashboard, no room management. That's enforced on the **server**, not just hidden in the UI — the API returns 403 if an employee tries an admin action." |
| Reservations tab → **Check In** a confirmed booking | "Check-in updates the reservation and flips the room to occupied automatically." |
| Click **+ Pay** on a checked-in guest, record a partial payment | "Payments support deposits, partials, and full payments — cash, card, bank transfer, or GCash." |
| Click **Check Out** on a checked-in guest | "Checkout computes the balance — total billed minus everything paid — takes the final payment, and frees the room." |
| Guests tab → click **Bubbles Librado** | "Clicking any guest shows their complete history: contact info, every booking with status, every payment, and lifetime totals — billed and spent. One query joining guests, reservations, rooms, and payments." |

**Ticked:** role-based access, reservation lifecycle, payments, guest history & spending records, room status automation.

## Part 4 — Admin · ~60s

| Do | Say |
|----|-----|
| Logout → sign in as `admin` | "The **admin** role sees everything." |
| Dashboard | "Real-time dashboard: occupancy, available rooms, active guests, total revenue, and the latest reservations — straight from aggregate queries." |
| Rooms tab | "Admins manage the physical inventory — add rooms, change floors, set a room to maintenance so it can't be booked." |
| Room Types tab | "And the catalog — types, descriptions, nightly rates, occupancy. Adding a type here immediately appears on the public site." |

**Ticked:** dashboard, inventory management, room type management.

## Part 5 — Data Integrity (the closer) · ~30s

| Do | Say |
|----|-----|
| Public site → try booking a type/date that's fully booked | "Double-booking is impossible — the server checks for date conflicts on every reservation and refuses if no room is free. Same check protects walk-in bookings made by staff." |
| (Optional) show `/login` on a second account | "Passwords are bcrypt-hashed, sessions are signed tokens, and every protected API route validates the role server-side." |

---

## Complete website walkthrough script (~4 minutes, admin POV)

*Read straight through while clicking. [Brackets] are your actions; everything else is
spoken. One login only — you present as the admin.*

> "This is AIKE — our web-based hotel reservation and guest management system, built with
> Node, Express, PostgreSQL, and React, and deployed live on Railway.
>
> **[Open the public site]** I'll start with what a guest sees — the public booking site,
> no login required. Every room type is shown with its rate and real-time availability —
> the Junior Suite shows 4 of 5 available because one is occupied right now. These
> counts aren't manual flags; they're computed from the reservations table by checking
> date overlaps.
>
> **[Pick dates in the hero, click Search Rooms]** If I search different dates, the
> counts recalculate for that range — availability is always per-date.
>
> **[Click View Details on a room, then Book Now]** Let me book a room the way a guest
> would. Two steps: choose dates, then enter details — the total is calculated
> automatically, nightly rate times nights. **[Fill in a name and email, Confirm]** On
> confirmation the system auto-assigns the first free room of this type — there's the
> room number — and the availability count on the card drops by one. Guests can also
> register an account, which links their login to a guest record so future bookings skip
> this form, and they get a 'My Bookings' page to track their reservations.
>
> **[Go to /login, sign in as admin]** Now the staff side. Staff sign in through a
> separate URL — there's no admin link anywhere on the public site. The system has three
> roles: customers, employees, and admins. I'm signing in as the **admin**, who sees
> everything; an **employee** gets only the front-desk subset — Reservations, Guests, and
> Payments — and that restriction is enforced by the API itself, not just hidden in the
> interface.
>
> **[Dashboard]** First thing an admin sees: the real-time dashboard — occupancy,
> available rooms, active guests, total revenue, and the most recent reservations, all
> from aggregate queries. You can see the booking I just made at the top.
>
> **[Reservations tab]** This is the front desk in action — the same screens an employee
> works with. Every reservation moves through a lifecycle. **[Click Check In on my new
> booking]** Checking the guest in updates the reservation and automatically flips the
> room to occupied. **[Click + Pay, record a deposit]** Payments support deposits,
> partial and full payments — cash, card, bank transfer, or GCash. **[Click Check Out]**
> And checkout computes the outstanding balance — total billed minus everything paid —
> takes the final payment, and frees the room again.
>
> **[Guests tab, click Bubbles Librado]** Clicking any guest opens their complete
> history: contact details, every booking with its status, every payment, and lifetime
> totals — billed and spent. That's one SQL query joining guests, reservations, rooms,
> and payments.
>
> **[Rooms tab]** As admin I also manage the physical inventory — adding rooms, changing
> floors, or setting a room to maintenance so it can't be booked. **[Room Types tab]**
> And the catalog itself — types, rates, descriptions — which updates the public site
> immediately.
>
> To summarize: five relational tables plus user accounts, three roles enforced
> server-side, bcrypt-hashed passwords, and automatic conflict detection that makes
> double-booking impossible. That's AIKE."

## Full spoken script (~1 minute)

> "AIKE is our web-based hotel reservation and guest management system, built on Node,
> Express, PostgreSQL, and React, deployed live on Railway.
>
> Guests browse rooms with real-time availability — computed by date from the
> reservations table — and book in two steps. The system auto-assigns a free room and
> calculates billing from the nightly rate and length of stay.
>
> It has three roles, enforced at the API level. Customers can register and view their
> own bookings. Employees handle the front desk — check-ins, checkouts, and payments by
> cash, card, bank transfer, or GCash — and can open any guest's complete history: every
> stay, every payment, lifetime totals. Admins additionally manage rooms, room types,
> and a live dashboard with occupancy and revenue.
>
> Behind it all: five relational tables plus user accounts, bcrypt-hashed passwords,
> and automatic conflict detection — so double-booking is impossible."

## If something goes wrong mid-demo

- Wrong counts / messy data → reseed (`node server/seed.js` with the DB URL) — takes 5 seconds, resets everything, keeps staff logins.
- Logged into the wrong role → Logout button is bottom-left in the panel, top-right on the public site.
- A booking fails with "no rooms available" → that's the conflict detection working; pick other dates and say it was intentional.
