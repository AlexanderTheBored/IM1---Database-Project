import React, { useState, useEffect } from "react";

const API = "/api";
const fmt = (n) => "₱" + Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2 });
const diffDays = (a, b) => Math.max(1, Math.round((new Date(b) - new Date(a)) / 864e5));
const today = () => new Date().toISOString().slice(0, 10);
const tomorrow = () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); };

async function api(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts, body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  return res.json();
}

const ROOM_FEATURES = {
  "Single": ["Single Bed", "Free WiFi", "Air Conditioning", "Private Bathroom"],
  "Double": ["Double Bed", "Free WiFi", "City View", "Mini Fridge", "Private Bathroom"],
  "Deluxe": ["King Bed", "Free WiFi", "Panoramic View", "Mini Bar", "Smart TV", "Room Service"],
  "Executive Suite": ["King Bed + Sofa", "Living Area", "Private Balcony", "Mini Bar", "Smart TV", "24/7 Concierge", "Complimentary Breakfast"],
};

const ROOM_IMAGES = {
  "Single": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop",
  "Double": "https://images.unsplash.com/photo-1590490360182-c33d955f4e24?w=600&h=400&fit=crop",
  "Deluxe": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop",
  "Executive Suite": "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&h=400&fit=crop",
};

/* ─── Styles ─── */
const S = {
  page: { fontFamily: "'Cormorant Garamond', Georgia, serif", background: "#faf8f4", color: "#2c2820", minHeight: "100vh" },
  nav: { position: "sticky", top: 0, zIndex: 100, background: "rgba(250,248,244,.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e8e2d8", padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  logo: { fontSize: 24, fontWeight: 700, color: "#8b7355", letterSpacing: 2 },
  hero: { position: "relative", height: 520, background: "linear-gradient(135deg, #2c2820 0%, #4a3f30 50%, #6b5b45 100%)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  heroOverlay: { position: "absolute", inset: 0, background: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&h=600&fit=crop') center/cover", opacity: 0.3 },
  heroContent: { position: "relative", zIndex: 1, textAlign: "center", color: "#faf8f4", maxWidth: 700, padding: "0 20px" },
  section: { maxWidth: 1100, margin: "0 auto", padding: "60px 24px" },
  h1: { fontSize: 52, fontWeight: 300, lineHeight: 1.15, letterSpacing: -1, marginBottom: 16 },
  h2: { fontSize: 36, fontWeight: 400, textAlign: "center", marginBottom: 8, color: "#2c2820" },
  subtitle: { fontSize: 16, fontFamily: "'DM Sans', sans-serif", fontWeight: 400, opacity: 0.75, letterSpacing: 1 },
  sectionSub: { fontSize: 15, fontFamily: "'DM Sans', sans-serif", textAlign: "center", color: "#8a7e6e", marginBottom: 48 },
  roomGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 },
  roomCard: { background: "#fff", borderRadius: 12, overflow: "hidden", border: "1px solid #e8e2d8", transition: "all .3s", cursor: "pointer" },
  roomImg: { width: "100%", height: 180, objectFit: "cover" },
  roomBody: { padding: "20px 22px" },
  roomName: { fontSize: 22, fontWeight: 600, color: "#2c2820", marginBottom: 4 },
  roomRate: { fontSize: 24, fontWeight: 700, color: "#8b7355" },
  roomRateSuffix: { fontSize: 13, fontWeight: 400, fontFamily: "'DM Sans', sans-serif", color: "#a09882" },
  featureList: { listStyle: "none", padding: 0, margin: "12px 0 0", display: "flex", flexWrap: "wrap", gap: 6 },
  featureTag: { fontSize: 11, fontFamily: "'DM Sans', sans-serif", padding: "4px 10px", borderRadius: 20, background: "#f5f1eb", color: "#6b5b45", fontWeight: 500 },
  btn: { fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, border: "none", borderRadius: 8, padding: "12px 28px", cursor: "pointer", transition: "all .2s" },
  btnPrimary: { background: "#8b7355", color: "#faf8f4" },
  btnOutline: { background: "transparent", color: "#8b7355", border: "2px solid #8b7355" },
  btnFull: { width: "100%", marginTop: 12 },
  input: { fontFamily: "'DM Sans', sans-serif", fontSize: 14, width: "100%", padding: "12px 14px", border: "1px solid #ddd5c8", borderRadius: 8, background: "#faf8f4", color: "#2c2820", outline: "none", boxSizing: "border-box" },
  label: { fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: "#8a7e6e", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 },
  formGroup: { marginBottom: 18 },
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(4px)", padding: 20 },
  modalContent: { background: "#faf8f4", borderRadius: 16, width: "100%", maxWidth: 520, maxHeight: "90vh", overflow: "auto", padding: 32 },
  divider: { height: 1, background: "#e8e2d8", margin: "24px 0", border: "none" },
  footer: { background: "#2c2820", color: "#a09882", padding: "40px 24px", textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: 13 },
};

/* ─── Components ─── */
const NavLink = ({ children, onClick }) => (
  <button onClick={onClick} style={{ background: "none", border: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#6b5b45", cursor: "pointer", fontWeight: 500, padding: "8px 16px" }}>{children}</button>
);

function SearchBar({ checkIn, checkOut, onCheckIn, onCheckOut, onSearch }) {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 32 }}>
      <div>
        <div style={{ fontSize: 11, fontFamily: "'DM Sans', sans-serif", color: "rgba(250,248,244,.6)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Check In</div>
        <input type="date" value={checkIn} onChange={(e) => onCheckIn(e.target.value)} min={today()}
          style={{ ...S.input, background: "rgba(255,255,255,.12)", color: "#faf8f4", border: "1px solid rgba(255,255,255,.2)", width: 180 }} />
      </div>
      <div>
        <div style={{ fontSize: 11, fontFamily: "'DM Sans', sans-serif", color: "rgba(250,248,244,.6)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Check Out</div>
        <input type="date" value={checkOut} onChange={(e) => onCheckOut(e.target.value)} min={checkIn || today()}
          style={{ ...S.input, background: "rgba(255,255,255,.12)", color: "#faf8f4", border: "1px solid rgba(255,255,255,.2)", width: 180 }} />
      </div>
      <div style={{ display: "flex", alignItems: "flex-end" }}>
        <button onClick={onSearch} style={{ ...S.btn, ...S.btnPrimary, padding: "12px 32px" }}>Search Rooms</button>
      </div>
    </div>
  );
}

function RoomCard({ type, available, onBook }) {
  const features = ROOM_FEATURES[type.type_name] || [];
  const img = ROOM_IMAGES[type.type_name] || ROOM_IMAGES["Single"];
  return (
    <div style={{ ...S.roomCard, opacity: available === 0 ? 0.5 : 1, transform: "translateY(0)", }} 
      onMouseEnter={(e) => { if (available > 0) e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,.1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
      <img src={img} alt={type.type_name} style={S.roomImg} />
      <div style={S.roomBody}>
        <div style={S.roomName}>{type.type_name}</div>
        <div style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#8a7e6e", marginBottom: 12 }}>{type.description}</div>
        <ul style={S.featureList}>
          {features.map((f) => <li key={f} style={S.featureTag}>{f}</li>)}
        </ul>
        <hr style={S.divider} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={S.roomRate}>{fmt(type.nightly_rate)}</span>
            <span style={S.roomRateSuffix}> /night</span>
          </div>
          <div style={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif", color: available > 0 ? "#4a8c5c" : "#c44" }}>
            {available > 0 ? `${available} available` : "Fully booked"}
          </div>
        </div>
        {available > 0 ? (
          <button onClick={() => onBook(type)} style={{ ...S.btn, ...S.btnPrimary, ...S.btnFull }}>Book Now</button>
        ) : (
          <button disabled style={{ ...S.btn, ...S.btnFull, background: "#ddd", color: "#999", cursor: "not-allowed" }}>Unavailable</button>
        )}
      </div>
    </div>
  );
}

function BookingModal({ type, rooms, checkIn, checkOut, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState(rooms[0]?.room_id || "");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", address: "" });
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  const nights = diffDays(checkIn, checkOut);
  const total = type.nightly_rate * nights;
  const set = (k, v) => setForm({ ...form, [k]: v });

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.email) return alert("Please fill in your name and email");
    setSubmitting(true);
    try {
      const guest = await api("/guests", { method: "POST", body: { first_name: form.firstName, last_name: form.lastName, email: form.email, phone: form.phone || null, address: form.address || null } });
      const reservation = await api("/reservations", { method: "POST", body: { guest_id: guest.guest_id, room_id: Number(selectedRoom), check_in_date: checkIn, check_out_date: checkOut, total_amount: total } });
      setConfirmation({ ...reservation, guest });
      setStep(3);
      if (onSuccess) onSuccess();
    } catch (e) {
      alert("Booking failed. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div style={S.modal} onClick={onClose}>
      <div style={S.modalContent} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#8b7355", fontWeight: 600, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>
              {step === 3 ? "Confirmed" : `Step ${step} of 2`}
            </div>
            <div style={{ fontSize: 26, fontWeight: 600, color: "#2c2820" }}>
              {step === 1 ? "Select Your Room" : step === 2 ? "Guest Details" : "Booking Confirmed!"}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, color: "#8a7e6e", cursor: "pointer" }}>✕</button>
        </div>

        <hr style={S.divider} />

        {/* Summary bar */}
        <div style={{ background: "#f0ece4", borderRadius: 10, padding: 16, marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}>
            <span style={{ color: "#6b5b45", fontWeight: 600 }}>{type.type_name}</span>
            <span style={{ color: "#8b7355", fontWeight: 700 }}>{fmt(total)}</span>
          </div>
          <div style={{ fontSize: 12, color: "#8a7e6e" }}>{checkIn} → {checkOut} · {nights} night{nights > 1 ? "s" : ""} · {fmt(type.nightly_rate)}/night</div>
        </div>

        {/* Step 1: Room selection */}
        {step === 1 && (
          <>
            <div style={S.label}>Choose a Room</div>
            <div style={{ display: "grid", gap: 8, marginBottom: 20 }}>
              {rooms.map((r) => (
                <label key={r.room_id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 10, cursor: "pointer",
                  border: selectedRoom === r.room_id ? "2px solid #8b7355" : "1px solid #e8e2d8",
                  background: selectedRoom === r.room_id ? "#f5f1eb" : "#fff",
                }}>
                  <input type="radio" name="room" value={r.room_id} checked={selectedRoom === r.room_id}
                    onChange={() => setSelectedRoom(r.room_id)} style={{ accentColor: "#8b7355" }} />
                  <div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: "#2c2820" }}>Room {r.room_number}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#8a7e6e" }}>Floor {r.floor}</div>
                  </div>
                </label>
              ))}
            </div>
            <button onClick={() => setStep(2)} style={{ ...S.btn, ...S.btnPrimary, ...S.btnFull }}>Continue</button>
          </>
        )}

        {/* Step 2: Guest info */}
        {step === 2 && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={S.formGroup}>
                <label style={S.label}>First Name *</label>
                <input style={S.input} value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="Maria" />
              </div>
              <div style={S.formGroup}>
                <label style={S.label}>Last Name *</label>
                <input style={S.input} value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Santos" />
              </div>
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Email *</label>
              <input style={S.input} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="maria@email.com" />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Phone</label>
              <input style={S.input} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0917-123-4567" />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Address</label>
              <input style={S.input} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Cebu City" />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ ...S.btn, ...S.btnOutline, flex: 1 }}>Back</button>
              <button onClick={handleSubmit} disabled={submitting} style={{ ...S.btn, ...S.btnPrimary, flex: 2, opacity: submitting ? 0.6 : 1 }}>
                {submitting ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          </>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && confirmation && (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#e6f5eb", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28 }}>✓</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>Thank you, {form.firstName}!</div>
            <div style={{ fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: "#8a7e6e", marginBottom: 20 }}>
              Your reservation <strong>#{confirmation.reservation_id}</strong> has been confirmed.
            </div>
            <div style={{ background: "#f0ece4", borderRadius: 10, padding: 20, textAlign: "left", fontFamily: "'DM Sans', sans-serif", fontSize: 13, lineHeight: 2 }}>
              <div><strong>Room:</strong> {type.type_name}</div>
              <div><strong>Check-in:</strong> {checkIn}</div>
              <div><strong>Check-out:</strong> {checkOut}</div>
              <div><strong>Total:</strong> {fmt(total)}</div>
              <div><strong>Status:</strong> <span style={{ color: "#4a8c5c", fontWeight: 600 }}>Confirmed</span></div>
            </div>
            <button onClick={onClose} style={{ ...S.btn, ...S.btnPrimary, ...S.btnFull, marginTop: 20 }}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  MAIN PUBLIC BOOKING PAGE                              */
/* ═══════════════════════════════════════════════════════ */
export default function BookingPage({ onSwitchToAdmin }) {
  const [roomTypes, setRoomTypes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [checkIn, setCheckIn] = useState(today());
  const [checkOut, setCheckOut] = useState(tomorrow());
  const [searched, setSearched] = useState(false);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [rt, rm] = await Promise.all([api("/room-types"), api("/rooms")]);
    setRoomTypes(rt);
    setRooms(rm);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const availableRooms = (typeId) =>
    rooms.filter((r) => r.type_id === typeId && r.status === "available");

  const handleSearch = () => setSearched(true);

  const handleBook = (type) => {
    const avail = availableRooms(type.type_id);
    if (avail.length === 0) return;
    setBooking({ type, rooms: avail });
  };

  if (loading) {
    return (
      <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <div style={{ fontSize: 22, color: "#8b7355" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Nav */}
      <nav style={S.nav}>
        <div style={S.logo}>HOTEL</div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <NavLink onClick={() => document.getElementById("rooms-section")?.scrollIntoView({ behavior: "smooth" })}>Rooms</NavLink>
          <NavLink onClick={() => document.getElementById("about-section")?.scrollIntoView({ behavior: "smooth" })}>About</NavLink>
          {onSwitchToAdmin && (
            <button onClick={onSwitchToAdmin} style={{ ...S.btn, ...S.btnOutline, padding: "8px 18px", fontSize: 12, marginLeft: 8 }}>Admin</button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div style={S.hero}>
        <div style={S.heroOverlay} />
        <div style={S.heroContent}>
          <div style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", letterSpacing: 4, textTransform: "uppercase", opacity: 0.6, marginBottom: 16 }}>Welcome to</div>
          <h1 style={S.h1}>Your Perfect Stay Awaits</h1>
          <p style={S.subtitle}>Experience unparalleled comfort and elegance. Book your room today and discover hospitality redefined.</p>
          <SearchBar checkIn={checkIn} checkOut={checkOut} onCheckIn={setCheckIn} onCheckOut={setCheckOut} onSearch={handleSearch} />
        </div>
      </div>

      {/* Rooms */}
      <section id="rooms-section" style={S.section}>
        <h2 style={S.h2}>Our Rooms & Suites</h2>
        <p style={S.sectionSub}>
          {searched
            ? `Showing availability for ${checkIn} to ${checkOut} (${diffDays(checkIn, checkOut)} night${diffDays(checkIn, checkOut) > 1 ? "s" : ""})`
            : "Select your dates above to check availability, or browse our room types below"}
        </p>
        <div style={S.roomGrid}>
          {roomTypes.map((type) => (
            <RoomCard key={type.type_id} type={type} available={availableRooms(type.type_id).length} onBook={handleBook} />
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about-section" style={{ background: "#f0ece4", padding: "60px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ ...S.h2, marginBottom: 16 }}>About Our Hotel</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#6b5b45", lineHeight: 1.8 }}>
            Nestled in the heart of the city, our hotel offers a perfect blend of modern luxury and timeless elegance.
            Whether you're here for business or leisure, every detail of your stay has been carefully curated
            to ensure an unforgettable experience. From our thoughtfully designed rooms to our warm,
            attentive service — welcome home.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 48, marginTop: 32, fontFamily: "'DM Sans', sans-serif" }}>
            {[["10+", "Room Types"], ["24/7", "Front Desk"], ["100%", "Guest Satisfaction"]].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#8b7355" }}>{n}</div>
                <div style={{ fontSize: 12, color: "#8a7e6e", marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={S.footer}>
        <div style={{ color: "#8b7355", fontSize: 18, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, letterSpacing: 2, marginBottom: 12 }}>HOTEL</div>
        <p>IM1 Part 2 — Database Project</p>
        <p style={{ marginTop: 4, color: "#6b5b45" }}>© 2026 Hotel Reservation System. All rights reserved.</p>
      </footer>

      {/* Booking Modal */}
      {booking && (
        <BookingModal
          type={booking.type}
          rooms={booking.rooms}
          checkIn={checkIn}
          checkOut={checkOut}
          onClose={() => { setBooking(null); loadData(); }}
          onSuccess={() => loadData()}
        />
      )}
    </div>
  );
}
