import React, { useState, useEffect, useCallback } from "react";

const API = "/api";

const fmt = (n) => "₱" + Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2 });
const diffDays = (a, b) => Math.max(1, Math.round((new Date(b) - new Date(a)) / 864e5));
const today = () => new Date().toISOString().slice(0, 10);

async function api(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts, body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  return res.json();
}

const STATUS_COLORS = {
  confirmed: { bg: "#1a3a2a", text: "#4ade80", label: "Confirmed" },
  checked_in: { bg: "#1a2a3a", text: "#60a5fa", label: "Checked In" },
  checked_out: { bg: "#2a2a2a", text: "#a1a1aa", label: "Checked Out" },
  cancelled: { bg: "#3a1a1a", text: "#f87171", label: "Cancelled" },
};

const Badge = ({ status }) => {
  const s = STATUS_COLORS[status] || STATUS_COLORS.confirmed;
  return <span style={{ background: s.bg, color: s.text, padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>{s.label}</span>;
};

const Btn = ({ children, onClick, variant = "primary", small, disabled, style: sx }) => {
  const base = { border: "none", borderRadius: 6, cursor: disabled ? "not-allowed" : "pointer", fontWeight: 600, fontFamily: "inherit", transition: "all .15s", opacity: disabled ? 0.4 : 1 };
  const size = small ? { padding: "5px 12px", fontSize: 11 } : { padding: "9px 20px", fontSize: 13 };
  const variants = { primary: { background: "#c9a84c", color: "#1a1714" }, secondary: { background: "#2a2723", color: "#c9a84c", border: "1px solid #3d3930" }, danger: { background: "#5c1a1a", color: "#f87171" }, ghost: { background: "transparent", color: "#a09882" }, success: { background: "#1a3a2a", color: "#4ade80" } };
  return <button style={{ ...base, ...size, ...variants[variant], ...sx }} onClick={onClick} disabled={disabled}>{children}</button>;
};

const Input = ({ label, ...props }) => (
  <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "#8a8070", fontWeight: 500 }}>
    {label}
    <input {...props} style={{ background: "#1e1b17", border: "1px solid #3d3930", borderRadius: 6, padding: "9px 12px", color: "#e8dcc8", fontSize: 13, fontFamily: "inherit", outline: "none", ...(props.style || {}) }} />
  </label>
);

const Select = ({ label, children, ...props }) => (
  <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "#8a8070", fontWeight: 500 }}>
    {label}
    <select {...props} style={{ background: "#1e1b17", border: "1px solid #3d3930", borderRadius: 6, padding: "9px 12px", color: "#e8dcc8", fontSize: 13, fontFamily: "inherit", outline: "none" }}>{children}</select>
  </label>
);

const Card = ({ children, style: sx, onClick }) => (
  <div onClick={onClick} style={{ background: "#1e1b17", border: "1px solid #2d2a24", borderRadius: 10, padding: 20, ...sx }}>{children}</div>
);

const Modal = ({ title, onClose, children, wide }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(4px)" }}>
    <div style={{ background: "#1a1814", border: "1px solid #2d2a24", borderRadius: 14, padding: 28, width: wide ? 600 : 440, maxHeight: "85vh", overflow: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ margin: 0, color: "#c9a84c", fontSize: 17, fontWeight: 700 }}>{title}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#8a8070", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const Table = ({ columns, data, onRowClick }) => (
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead><tr>{columns.map((c) => <th key={c.key} style={{ textAlign: "left", padding: "10px 12px", color: "#8a8070", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8, borderBottom: "1px solid #2d2a24" }}>{c.label}</th>)}</tr></thead>
      <tbody>
        {data.length === 0 && <tr><td colSpan={columns.length} style={{ padding: 30, textAlign: "center", color: "#5a5040" }}>No records found</td></tr>}
        {data.map((row, i) => (
          <tr key={row.room_id || row.guest_id || row.reservation_id || row.payment_id || i} onClick={() => onRowClick?.(row)} style={{ cursor: onRowClick ? "pointer" : "default", borderBottom: "1px solid #1e1b17" }}>
            {columns.map((c) => <td key={c.key} style={{ padding: "10px 12px", color: "#d4c9b4" }}>{c.render ? c.render(row) : row[c.key]}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Stat = ({ label, value, accent }) => (
  <Card style={{ flex: 1, minWidth: 140 }}>
    <div style={{ fontSize: 11, color: "#8a8070", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 800, color: accent || "#c9a84c", letterSpacing: -0.5 }}>{value}</div>
  </Card>
);

export default function AdminPage({ onSwitchToBooking }) {
  const [tab, setTab] = useState("dashboard");
  const [roomTypes, setRoomTypes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [dashboard, setDashboard] = useState({});
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const [rt, rm, g, res, pay, dash] = await Promise.all([
      api("/room-types"), api("/rooms"), api("/guests"),
      api("/reservations"), api("/payments"), api("/dashboard"),
    ]);
    setRoomTypes(rt); setRooms(rm); setGuests(g);
    setReservations(res); setPayments(pay); setDashboard(dash);
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const updateResStatus = async (id, status) => { await api(`/reservations/${id}/status`, { method: "PATCH", body: { status } }); await reload(); };
  const createPayment = async (data) => { await api("/payments", { method: "POST", body: data }); await reload(); };
  const createGuest = async (data) => { const r = await api("/guests", { method: "POST", body: data }); await reload(); return r; };
  const deleteItem = async (endpoint) => { const r = await api(endpoint, { method: "DELETE" }); if (r.error) { alert(r.error); return false; } await reload(); return true; };
  const updateItem = async (endpoint, data) => { await api(endpoint, { method: "PUT", body: data }); await reload(); };

  const openNewReservation = (prefillRoomId) => {
    setModal({ type: "new-reservation", form: { guestMode: "existing", guestId: guests[0]?.guest_id || "", firstName: "", lastName: "", email: "", phone: "", address: "", roomId: prefillRoomId || rooms[0]?.room_id || "", checkIn: today(), checkOut: "", depositAmount: "", depositMethod: "cash" } });
  };
  const openCheckout = (res) => {
    const nights = diffDays(res.check_in_date, res.check_out_date || today());
    const total = res.total_amount || (res.nightly_rate || 0) * nights;
    const paid = payments.filter((p) => p.reservation_id === res.reservation_id).reduce((s, p) => s + p.amount, 0);
    setModal({ type: "checkout", res, nights, total, paid, balance: Math.max(0, total - paid), payAmount: Math.max(0, total - paid), payMethod: "cash" });
  };
  const openPayment = (res) => setModal({ type: "add-payment", res, amount: "", method: "cash" });
  const openNewRoom = () => setModal({ type: "new-room", form: { number: "", typeId: roomTypes[0]?.type_id || 1, floor: 1 } });
  const openNewRoomType = () => setModal({ type: "new-room-type", form: { name: "", description: "", rate: "" } });
  const openEditGuest = (g) => setModal({ type: "edit-guest", guest: g, form: { first_name: g.first_name, last_name: g.last_name, email: g.email || "", phone: g.phone || "", address: g.address || "" } });
  const openEditRoom = (r) => setModal({ type: "edit-room", room: r, form: { room_number: r.room_number, type_id: r.type_id, floor: r.floor, status: r.status } });
  const openEditRoomType = (t) => setModal({ type: "edit-room-type", roomType: t, form: { type_name: t.type_name, description: t.description || "", nightly_rate: t.nightly_rate, max_occupancy: t.max_occupancy || 1 } });
  const openDeleteConfirm = (message, endpoint) => setModal({ type: "delete-confirm", message, endpoint });
  const openResDetail = (res) => {
    const nights = diffDays(res.check_in_date, res.check_out_date || today());
    const total = res.total_amount || (res.nightly_rate || 0) * nights;
    const paid = payments.filter((p) => p.reservation_id === res.reservation_id).reduce((s, p) => s + p.amount, 0);
    const resPayments = payments.filter((p) => p.reservation_id === res.reservation_id);
    setModal({ type: "res-detail", res, nights, total, paid, resPayments });
  };

  const navItems = [
    { key: "dashboard", icon: "◈", label: "Dashboard" },
    { key: "rooms", icon: "⌂", label: "Rooms" },
    { key: "guests", icon: "☺", label: "Guests" },
    { key: "reservations", icon: "▤", label: "Reservations" },
    { key: "payments", icon: "₱", label: "Payments" },
    { key: "room-types", icon: "★", label: "Room Types" },
  ];

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#141210", color: "#c9a84c", fontSize: 18 }}>Loading...</div>;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#141210", color: "#d4c9b4", minHeight: "100vh", display: "flex" }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <nav style={{ width: 220, background: "#18150f", borderRight: "1px solid #2d2a24", padding: "24px 0", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: "0 20px 28px", borderBottom: "1px solid #2d2a24" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#c9a84c", letterSpacing: 1, fontFamily: "'Libre Baskerville', serif" }}>HOTEL</div>
          <div style={{ fontSize: 10, color: "#8a8070", letterSpacing: 3, textTransform: "uppercase", marginTop: 2 }}>Admin Panel</div>
        </div>
        <div style={{ marginTop: 16, flex: 1 }}>
          {navItems.map((n) => (
            <button key={n.key} onClick={() => { setTab(n.key); setSearch(""); setStatusFilter(""); }}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 20px", border: "none", background: tab === n.key ? "#1e1b17" : "transparent", color: tab === n.key ? "#c9a84c" : "#8a8070", fontSize: 13, fontFamily: "inherit", fontWeight: tab === n.key ? 700 : 500, cursor: "pointer", borderLeft: tab === n.key ? "3px solid #c9a84c" : "3px solid transparent" }}>
              <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </div>
        <div style={{ padding: "16px 20px", borderTop: "1px solid #2d2a24", display: "flex", flexDirection: "column", gap: 8 }}>
          <Btn onClick={() => openNewReservation()} style={{ width: "100%" }}>+ New Booking</Btn>
          {onSwitchToBooking && <Btn variant="ghost" onClick={onSwitchToBooking} style={{ width: "100%", fontSize: 11 }}>← View Booking Site</Btn>}
        </div>
      </nav>

      <main style={{ flex: 1, padding: 28, overflow: "auto" }}>
        {tab === "dashboard" && (<>
          <h2 style={{ margin: "0 0 20px", color: "#e8dcc8", fontFamily: "'Libre Baskerville', serif", fontWeight: 700, fontSize: 22 }}>Dashboard</h2>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
            <Stat label="Occupied" value={dashboard.occupied || 0} accent="#60a5fa" />
            <Stat label="Available" value={dashboard.available || 0} accent="#4ade80" />
            <Stat label="Active Guests" value={dashboard.activeGuests || 0} accent="#c9a84c" />
            <Stat label="Revenue" value={fmt(dashboard.totalRevenue || 0)} accent="#c9a84c" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Card>
              <h4 style={{ margin: "0 0 14px", color: "#c9a84c", fontSize: 14 }}>Room Availability</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {rooms.map((r) => { const colors = { available: "#4ade80", occupied: "#60a5fa", maintenance: "#fbbf24" }; return (
                  <div key={r.room_id} style={{ background: "#141210", borderRadius: 8, padding: "10px 8px", textAlign: "center", border: `1px solid ${(colors[r.status]||"#555")}33` }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: colors[r.status]||"#888" }}>{r.room_number}</div>
                    <div style={{ fontSize: 9, color: "#8a8070", textTransform: "uppercase", marginTop: 2 }}>{r.type_name}</div>
                    <div style={{ fontSize: 9, color: colors[r.status]||"#888", marginTop: 4, fontWeight: 600 }}>{r.status}</div>
                  </div>); })}
              </div>
            </Card>
            <Card>
              <h4 style={{ margin: "0 0 14px", color: "#c9a84c", fontSize: 14 }}>Recent Reservations</h4>
              {(dashboard.recentReservations || []).map((r) => (
                <div key={r.reservation_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #2d2a24" }}>
                  <div><div style={{ fontSize: 13, fontWeight: 600 }}>{r.first_name} {r.last_name}</div><div style={{ fontSize: 11, color: "#8a8070" }}>Room {r.room_number} · {r.check_in_date}</div></div>
                  <Badge status={r.status} />
                </div>))}
            </Card>
          </div>
        </>)}

        {tab === "rooms" && (<>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ margin: 0, color: "#e8dcc8", fontFamily: "'Libre Baskerville', serif", fontWeight: 700, fontSize: 22 }}>Rooms</h2>
            <Btn onClick={openNewRoom}>+ Add Room</Btn>
          </div>
          <Card><Table columns={[
            { key: "room_number", label: "Room #", render: (r) => <span style={{ fontWeight: 700, color: "#c9a84c" }}>{r.room_number}</span> },
            { key: "type_name", label: "Type" }, { key: "floor", label: "Floor" },
            { key: "nightly_rate", label: "Rate/Night", render: (r) => fmt(r.nightly_rate) },
            { key: "status", label: "Status", render: (r) => { const c = { available: "#4ade80", occupied: "#60a5fa", maintenance: "#fbbf24" }; return <span style={{ color: c[r.status]||"#888", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>{r.status}</span>; }},
            { key: "actions", label: "", render: (r) => (<div style={{ display: "flex", gap: 4 }} onClick={e=>e.stopPropagation()}>
              {r.status === "available" && <Btn small variant="secondary" onClick={() => openNewReservation(r.room_id)}>Book</Btn>}
              <Btn small variant="ghost" onClick={() => openEditRoom(r)}>Edit</Btn>
              <Btn small variant="danger" onClick={() => openDeleteConfirm(`Delete Room ${r.room_number}?`, `/rooms/${r.room_id}`)}>✕</Btn>
            </div>) },
          ]} data={rooms} /></Card>
        </>)}

        {tab === "guests" && (<>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ margin: 0, color: "#e8dcc8", fontFamily: "'Libre Baskerville', serif", fontWeight: 700, fontSize: 22 }}>Guests</h2>
            <Input placeholder="Search guests…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 220 }} />
          </div>
          <Card><Table columns={[
            { key: "name", label: "Name", render: (g) => <span style={{ fontWeight: 600 }}>{g.first_name} {g.last_name}</span> },
            { key: "email", label: "Email" }, { key: "phone", label: "Phone" }, { key: "address", label: "Address" },
            { key: "actions", label: "", render: (g) => (<div style={{ display: "flex", gap: 4 }} onClick={e=>e.stopPropagation()}>
              <Btn small variant="ghost" onClick={() => openEditGuest(g)}>Edit</Btn>
              <Btn small variant="danger" onClick={() => openDeleteConfirm(`Delete ${g.first_name} ${g.last_name}? Fails if they have reservations.`, `/guests/${g.guest_id}`)}>✕</Btn>
            </div>) },
          ]} data={guests.filter((g) => { if (!search) return true; const s = search.toLowerCase(); return `${g.first_name} ${g.last_name}`.toLowerCase().includes(s) || (g.email||"").toLowerCase().includes(s); })} /></Card>
        </>)}

        {tab === "reservations" && (<>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ margin: 0, color: "#e8dcc8", fontFamily: "'Libre Baskerville', serif", fontWeight: 700, fontSize: 22 }}>Reservations</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="">All statuses</option>{Object.entries(STATUS_COLORS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</Select>
              <Btn onClick={() => openNewReservation()}>+ New Booking</Btn>
            </div>
          </div>
          <Card><Table columns={[
            { key: "id", label: "ID", render: (r) => <span style={{ color: "#8a8070" }}>#{r.reservation_id}</span> },
            { key: "guest", label: "Guest", render: (r) => `${r.first_name} ${r.last_name}` },
            { key: "room", label: "Room", render: (r) => `${r.room_number} (${r.type_name})` },
            { key: "check_in_date", label: "Check-In" }, { key: "check_out_date", label: "Check-Out" },
            { key: "total_amount", label: "Total", render: (r) => fmt(r.total_amount || 0) },
            { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
            { key: "actions", label: "", render: (r) => (<div style={{ display: "flex", gap: 4 }} onClick={e=>e.stopPropagation()}>
              {r.status === "confirmed" && <Btn small variant="success" onClick={() => updateResStatus(r.reservation_id, "checked_in")}>Check In</Btn>}
              {r.status === "checked_in" && <Btn small variant="secondary" onClick={() => openCheckout(r)}>Check Out</Btn>}
              {(r.status === "confirmed" || r.status === "checked_in") && <Btn small variant="ghost" onClick={() => openPayment(r)}>+ Pay</Btn>}
              {r.status === "confirmed" && <Btn small variant="danger" onClick={() => updateResStatus(r.reservation_id, "cancelled")}>Cancel</Btn>}
            </div>) },
          ]} data={reservations.filter((r) => !statusFilter || r.status === statusFilter)} onRowClick={openResDetail} /></Card>
        </>)}

        {tab === "payments" && (<>
          <h2 style={{ margin: "0 0 20px", color: "#e8dcc8", fontFamily: "'Libre Baskerville', serif", fontWeight: 700, fontSize: 22 }}>Payments</h2>
          <Card><Table columns={[
            { key: "id", label: "ID", render: (p) => <span style={{ color: "#8a8070" }}>#{p.payment_id}</span> },
            { key: "reservation", label: "Reservation", render: (p) => `#${p.reservation_id} — ${p.first_name} ${p.last_name}` },
            { key: "room", label: "Room", render: (p) => p.room_number },
            { key: "amount", label: "Amount", render: (p) => <span style={{ fontWeight: 700, color: "#4ade80" }}>{fmt(p.amount)}</span> },
            { key: "payment_type", label: "Type", render: (p) => <span style={{ textTransform: "capitalize" }}>{p.payment_type}</span> },
            { key: "payment_method", label: "Method", render: (p) => <span style={{ textTransform: "capitalize" }}>{(p.payment_method||"").replace("_"," ")}</span> },
            { key: "payment_date", label: "Date" },
            { key: "actions", label: "", render: (p) => (<div onClick={e=>e.stopPropagation()}><Btn small variant="danger" onClick={() => openDeleteConfirm(`Delete payment of ${fmt(p.amount)}?`, `/payments/${p.payment_id}`)}>✕</Btn></div>) },
          ]} data={payments} /></Card>
        </>)}

        {tab === "room-types" && (<>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ margin: 0, color: "#e8dcc8", fontFamily: "'Libre Baskerville', serif", fontWeight: 700, fontSize: 22 }}>Room Types</h2>
            <Btn onClick={openNewRoomType}>+ Add Type</Btn>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
            {roomTypes.map((t) => { const count = rooms.filter((r) => r.type_id === t.type_id).length; return (
              <Card key={t.type_id} style={{ borderTop: "3px solid #c9a84c" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div><div style={{ fontSize: 16, fontWeight: 700, color: "#e8dcc8" }}>{t.type_name}</div><div style={{ fontSize: 12, color: "#8a8070", marginTop: 4 }}>{t.description}</div></div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <Btn small variant="ghost" onClick={() => openEditRoomType(t)}>Edit</Btn>
                    <Btn small variant="danger" onClick={() => openDeleteConfirm(`Delete "${t.type_name}"? Fails if rooms use this type.`, `/room-types/${t.type_id}`)}>✕</Btn>
                  </div>
                </div>
                <div style={{ marginTop: 10, fontSize: 11, color: "#8a8070", background: "#141210", padding: "3px 8px", borderRadius: 4, display: "inline-block" }}>{count} rooms</div>
                <div style={{ marginTop: 10, fontSize: 22, fontWeight: 800, color: "#c9a84c" }}>{fmt(t.nightly_rate)}<span style={{ fontSize: 11, fontWeight: 400, color: "#8a8070" }}> /night</span></div>
              </Card>); })}
          </div>
        </>)}
      </main>

      {/* ═══ MODALS ═══ */}

      {modal?.type === "delete-confirm" && (
        <Modal title="Confirm Delete" onClose={() => setModal(null)}>
          <p style={{ fontSize: 14, color: "#d4c9b4", lineHeight: 1.6, marginBottom: 20 }}>{modal.message}</p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn variant="danger" onClick={async () => { await deleteItem(modal.endpoint); setModal(null); }}>Delete</Btn>
          </div>
        </Modal>
      )}

      {modal?.type === "edit-guest" && (
        <Modal title={`Edit — ${modal.guest.first_name} ${modal.guest.last_name}`} onClose={() => setModal(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Input label="First Name" value={modal.form.first_name} onChange={(e) => setModal({ ...modal, form: { ...modal.form, first_name: e.target.value } })} />
            <Input label="Last Name" value={modal.form.last_name} onChange={(e) => setModal({ ...modal, form: { ...modal.form, last_name: e.target.value } })} />
          </div>
          <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
            <Input label="Email" value={modal.form.email} onChange={(e) => setModal({ ...modal, form: { ...modal.form, email: e.target.value } })} />
            <Input label="Phone" value={modal.form.phone} onChange={(e) => setModal({ ...modal, form: { ...modal.form, phone: e.target.value } })} />
            <Input label="Address" value={modal.form.address} onChange={(e) => setModal({ ...modal, form: { ...modal.form, address: e.target.value } })} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={async () => { await updateItem(`/guests/${modal.guest.guest_id}`, modal.form); setModal(null); }}>Save Changes</Btn>
          </div>
        </Modal>
      )}

      {modal?.type === "edit-room" && (
        <Modal title={`Edit Room ${modal.room.room_number}`} onClose={() => setModal(null)}>
          <div style={{ display: "grid", gap: 10 }}>
            <Input label="Room Number" value={modal.form.room_number} onChange={(e) => setModal({ ...modal, form: { ...modal.form, room_number: e.target.value } })} />
            <Select label="Room Type" value={modal.form.type_id} onChange={(e) => setModal({ ...modal, form: { ...modal.form, type_id: Number(e.target.value) } })}>
              {roomTypes.map((t) => <option key={t.type_id} value={t.type_id}>{t.type_name} — {fmt(t.nightly_rate)}/night</option>)}
            </Select>
            <Input label="Floor" type="number" value={modal.form.floor} onChange={(e) => setModal({ ...modal, form: { ...modal.form, floor: Number(e.target.value) } })} />
            <Select label="Status" value={modal.form.status} onChange={(e) => setModal({ ...modal, form: { ...modal.form, status: e.target.value } })}>
              <option value="available">Available</option><option value="occupied">Occupied</option><option value="maintenance">Maintenance</option>
            </Select>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={async () => { await updateItem(`/rooms/${modal.room.room_id}`, modal.form); setModal(null); }}>Save Changes</Btn>
          </div>
        </Modal>
      )}

      {modal?.type === "edit-room-type" && (
        <Modal title={`Edit — ${modal.roomType.type_name}`} onClose={() => setModal(null)}>
          <div style={{ display: "grid", gap: 10 }}>
            <Input label="Name" value={modal.form.type_name} onChange={(e) => setModal({ ...modal, form: { ...modal.form, type_name: e.target.value } })} />
            <Input label="Description" value={modal.form.description} onChange={(e) => setModal({ ...modal, form: { ...modal.form, description: e.target.value } })} />
            <Input label="Nightly Rate (₱)" type="number" value={modal.form.nightly_rate} onChange={(e) => setModal({ ...modal, form: { ...modal.form, nightly_rate: Number(e.target.value) } })} />
            <Input label="Max Occupancy" type="number" value={modal.form.max_occupancy} onChange={(e) => setModal({ ...modal, form: { ...modal.form, max_occupancy: Number(e.target.value) } })} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={async () => { await updateItem(`/room-types/${modal.roomType.type_id}`, modal.form); setModal(null); }}>Save Changes</Btn>
          </div>
        </Modal>
      )}

      {modal?.type === "new-reservation" && (
        <Modal title="New Reservation" onClose={() => setModal(null)} wide>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <Btn variant={modal.form.guestMode === "existing" ? "primary" : "secondary"} small onClick={() => setModal({ ...modal, form: { ...modal.form, guestMode: "existing" } })}>Existing Guest</Btn>
            <Btn variant={modal.form.guestMode === "new" ? "primary" : "secondary"} small onClick={() => setModal({ ...modal, form: { ...modal.form, guestMode: "new" } })}>New Guest</Btn>
          </div>
          {modal.form.guestMode === "existing" ? (
            <Select label="Guest" value={modal.form.guestId} onChange={(e) => setModal({ ...modal, form: { ...modal.form, guestId: Number(e.target.value) } })}>
              {guests.map((g) => <option key={g.guest_id} value={g.guest_id}>{g.first_name} {g.last_name}</option>)}
            </Select>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Input label="First Name" value={modal.form.firstName} onChange={(e) => setModal({ ...modal, form: { ...modal.form, firstName: e.target.value } })} />
              <Input label="Last Name" value={modal.form.lastName} onChange={(e) => setModal({ ...modal, form: { ...modal.form, lastName: e.target.value } })} />
              <Input label="Email" value={modal.form.email} onChange={(e) => setModal({ ...modal, form: { ...modal.form, email: e.target.value } })} />
              <Input label="Phone" value={modal.form.phone} onChange={(e) => setModal({ ...modal, form: { ...modal.form, phone: e.target.value } })} />
              <Input label="Address" value={modal.form.address} onChange={(e) => setModal({ ...modal, form: { ...modal.form, address: e.target.value } })} style={{ gridColumn: "span 2" }} />
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 14 }}>
            <Select label="Room" value={modal.form.roomId} onChange={(e) => setModal({ ...modal, form: { ...modal.form, roomId: Number(e.target.value) } })}>
              {rooms.map((r) => <option key={r.room_id} value={r.room_id} disabled={r.status !== "available"}>Room {r.room_number} — {r.type_name} {r.status !== "available" ? `(${r.status})` : ""}</option>)}
            </Select>
            <Input label="Check-In" type="date" value={modal.form.checkIn} onChange={(e) => setModal({ ...modal, form: { ...modal.form, checkIn: e.target.value } })} />
            <Input label="Check-Out" type="date" value={modal.form.checkOut} onChange={(e) => setModal({ ...modal, form: { ...modal.form, checkOut: e.target.value } })} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
            <Input label="Deposit Amount" type="number" placeholder="Optional" value={modal.form.depositAmount} onChange={(e) => setModal({ ...modal, form: { ...modal.form, depositAmount: e.target.value } })} />
            <Select label="Payment Method" value={modal.form.depositMethod} onChange={(e) => setModal({ ...modal, form: { ...modal.form, depositMethod: e.target.value } })}>
              <option value="cash">Cash</option><option value="card">Card</option><option value="bank_transfer">Bank Transfer</option><option value="gcash">GCash</option>
            </Select>
          </div>
          {modal.form.checkIn && modal.form.checkOut && modal.form.roomId && (() => {
            const room = rooms.find((r) => r.room_id === modal.form.roomId);
            const nights = diffDays(modal.form.checkIn, modal.form.checkOut);
            return (<div style={{ marginTop: 14, padding: 12, background: "#141210", borderRadius: 8, fontSize: 13 }}>
              <span style={{ color: "#8a8070" }}>Estimated total: </span>
              <span style={{ color: "#c9a84c", fontWeight: 700 }}>{fmt((room?.nightly_rate || 0) * nights)}</span>
              <span style={{ color: "#8a8070" }}> ({nights} night{nights > 1 ? "s" : ""})</span>
            </div>);
          })()}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={async () => {
              let guestId = modal.form.guestId;
              if (modal.form.guestMode === "new") { if (!modal.form.firstName || !modal.form.lastName) return alert("Guest name required"); const ng = await createGuest({ first_name: modal.form.firstName, last_name: modal.form.lastName, email: modal.form.email || null, phone: modal.form.phone || null, address: modal.form.address || null }); guestId = ng.guest_id; }
              if (!modal.form.checkIn || !modal.form.checkOut) return alert("Dates required");
              if (!modal.form.roomId) return alert("Select a room");
              const room = rooms.find((r) => r.room_id === modal.form.roomId);
              const nights = diffDays(modal.form.checkIn, modal.form.checkOut);
              const total = (room?.nightly_rate || 0) * nights;
              const res = await api("/reservations", { method: "POST", body: { guest_id: Number(guestId), room_id: Number(modal.form.roomId), check_in_date: modal.form.checkIn, check_out_date: modal.form.checkOut, total_amount: total } });
              if (modal.form.depositAmount && Number(modal.form.depositAmount) > 0) { await createPayment({ reservation_id: res.reservation_id, amount: Number(modal.form.depositAmount), payment_type: "deposit", payment_method: modal.form.depositMethod, payment_date: today() }); }
              await reload(); setModal(null); setTab("reservations");
            }}>Confirm Booking</Btn>
          </div>
        </Modal>
      )}

      {modal?.type === "checkout" && (
        <Modal title="Check Out" onClose={() => setModal(null)}>
          <div style={{ fontSize: 13, lineHeight: 1.8 }}>
            <div><strong>Room:</strong> {modal.res.room_number}</div>
            <div><strong>Nights:</strong> {modal.nights}</div>
            <div><strong>Total Due:</strong> {fmt(modal.total)}</div>
            <div><strong>Already Paid:</strong> {fmt(modal.paid)}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: modal.balance > 0 ? "#f87171" : "#4ade80", marginTop: 8 }}>Balance: {fmt(modal.balance)}</div>
          </div>
          {modal.balance > 0 && (<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
            <Input label="Payment Amount" type="number" value={modal.payAmount} onChange={(e) => setModal({ ...modal, payAmount: e.target.value })} />
            <Select label="Method" value={modal.payMethod} onChange={(e) => setModal({ ...modal, payMethod: e.target.value })}><option value="cash">Cash</option><option value="card">Card</option><option value="bank_transfer">Bank Transfer</option><option value="gcash">GCash</option></Select>
          </div>)}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={async () => {
              if (modal.balance > 0 && Number(modal.payAmount) > 0) { await createPayment({ reservation_id: modal.res.reservation_id, amount: Number(modal.payAmount), payment_type: "full", payment_method: modal.payMethod, payment_date: today() }); }
              await updateResStatus(modal.res.reservation_id, "checked_out"); setModal(null);
            }}>Complete Checkout</Btn>
          </div>
        </Modal>
      )}

      {modal?.type === "add-payment" && (
        <Modal title={`Add Payment — Reservation #${modal.res.reservation_id}`} onClose={() => setModal(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Input label="Amount" type="number" value={modal.amount} onChange={(e) => setModal({ ...modal, amount: e.target.value })} />
            <Select label="Method" value={modal.method} onChange={(e) => setModal({ ...modal, method: e.target.value })}><option value="cash">Cash</option><option value="card">Card</option><option value="bank_transfer">Bank Transfer</option><option value="gcash">GCash</option></Select>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={async () => { if (!modal.amount || Number(modal.amount) <= 0) return alert("Enter a valid amount"); await createPayment({ reservation_id: modal.res.reservation_id, amount: Number(modal.amount), payment_type: "partial", payment_method: modal.method, payment_date: today() }); setModal(null); }}>Record Payment</Btn>
          </div>
        </Modal>
      )}

      {modal?.type === "new-room" && (
        <Modal title="Add Room" onClose={() => setModal(null)}>
          <div style={{ display: "grid", gap: 10 }}>
            <Input label="Room Number" value={modal.form.number} onChange={(e) => setModal({ ...modal, form: { ...modal.form, number: e.target.value } })} />
            <Select label="Room Type" value={modal.form.typeId} onChange={(e) => setModal({ ...modal, form: { ...modal.form, typeId: Number(e.target.value) } })}>{roomTypes.map((t) => <option key={t.type_id} value={t.type_id}>{t.type_name} — {fmt(t.nightly_rate)}/night</option>)}</Select>
            <Input label="Floor" type="number" value={modal.form.floor} onChange={(e) => setModal({ ...modal, form: { ...modal.form, floor: Number(e.target.value) } })} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={async () => { if (!modal.form.number) return alert("Room number required"); await api("/rooms", { method: "POST", body: { room_number: modal.form.number, type_id: modal.form.typeId, floor: modal.form.floor } }); await reload(); setModal(null); }}>Add Room</Btn>
          </div>
        </Modal>
      )}

      {modal?.type === "new-room-type" && (
        <Modal title="Add Room Type" onClose={() => setModal(null)}>
          <div style={{ display: "grid", gap: 10 }}>
            <Input label="Name" value={modal.form.name} onChange={(e) => setModal({ ...modal, form: { ...modal.form, name: e.target.value } })} />
            <Input label="Description" value={modal.form.description} onChange={(e) => setModal({ ...modal, form: { ...modal.form, description: e.target.value } })} />
            <Input label="Nightly Rate (₱)" type="number" value={modal.form.rate} onChange={(e) => setModal({ ...modal, form: { ...modal.form, rate: e.target.value } })} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={async () => { if (!modal.form.name || !modal.form.rate) return alert("Name and rate required"); await api("/room-types", { method: "POST", body: { type_name: modal.form.name, description: modal.form.description, nightly_rate: Number(modal.form.rate) } }); await reload(); setModal(null); }}>Add Type</Btn>
          </div>
        </Modal>
      )}

      {modal?.type === "res-detail" && (
        <Modal title={`Reservation #${modal.res.reservation_id}`} onClose={() => setModal(null)} wide>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div><div style={{ fontSize: 11, color: "#8a8070", textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>Guest</div><div style={{ fontSize: 15, fontWeight: 700 }}>{modal.res.first_name} {modal.res.last_name}</div><div style={{ fontSize: 12, color: "#8a8070", marginTop: 2 }}>{modal.res.guest_email} · {modal.res.guest_phone}</div></div>
            <div><div style={{ fontSize: 11, color: "#8a8070", textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>Room</div><div style={{ fontSize: 15, fontWeight: 700 }}>Room {modal.res.room_number} — {modal.res.type_name}</div><div style={{ fontSize: 12, color: "#8a8070", marginTop: 2 }}>{fmt(modal.res.nightly_rate)} / night</div></div>
            <div><div style={{ fontSize: 11, color: "#8a8070", textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>Stay</div><div style={{ fontSize: 13 }}>{modal.res.check_in_date} → {modal.res.check_out_date}</div><div style={{ fontSize: 12, color: "#8a8070" }}>{modal.nights} night{modal.nights > 1 ? "s" : ""}</div></div>
            <div><div style={{ fontSize: 11, color: "#8a8070", textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>Status</div><Badge status={modal.res.status} /></div>
          </div>
          <div style={{ marginTop: 20, padding: 14, background: "#141210", borderRadius: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}><span style={{ color: "#8a8070" }}>Total</span><span style={{ fontWeight: 700 }}>{fmt(modal.total)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}><span style={{ color: "#8a8070" }}>Paid</span><span style={{ fontWeight: 700, color: "#4ade80" }}>{fmt(modal.paid)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, borderTop: "1px solid #2d2a24", paddingTop: 8, marginTop: 4 }}><span style={{ fontWeight: 700 }}>Balance</span><span style={{ fontWeight: 800, color: modal.total - modal.paid > 0 ? "#f87171" : "#4ade80" }}>{fmt(Math.max(0, modal.total - modal.paid))}</span></div>
          </div>
          {modal.resPayments.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, color: "#8a8070", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Payment History</div>
              {modal.resPayments.map((p) => (
                <div key={p.payment_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #1e1b17", fontSize: 12 }}>
                  <span>{p.payment_date} · <span style={{ textTransform: "capitalize" }}>{p.payment_type}</span> · <span style={{ textTransform: "capitalize" }}>{(p.payment_method||"").replace("_"," ")}</span></span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 700, color: "#4ade80" }}>{fmt(p.amount)}</span>
                    <Btn small variant="danger" onClick={async () => { await deleteItem(`/payments/${p.payment_id}`); const updated = modal.resPayments.filter(x => x.payment_id !== p.payment_id); const newPaid = updated.reduce((s,x)=>s+x.amount,0); setModal({...modal, resPayments: updated, paid: newPaid}); }}>✕</Btn>
                  </div>
                </div>))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
            {(modal.res.status === "confirmed" || modal.res.status === "checked_in") && <Btn variant="ghost" onClick={() => { setModal(null); openPayment(modal.res); }}>+ Add Payment</Btn>}
            {modal.res.status === "confirmed" && <Btn variant="success" small onClick={async () => { await updateResStatus(modal.res.reservation_id, "checked_in"); setModal(null); }}>Check In</Btn>}
            {modal.res.status === "checked_in" && <Btn variant="secondary" small onClick={() => { setModal(null); openCheckout(modal.res); }}>Check Out</Btn>}
          </div>
        </Modal>
      )}
    </div>
  );
}
