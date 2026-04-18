import React, { useState } from "react";
import BookingPage from "./BookingPage";
import AdminPage from "./AdminPage";

export default function App() {
  const [view, setView] = useState("booking");

  if (view === "admin") {
    return <AdminPage onSwitchToBooking={() => setView("booking")} />;
  }

  return <BookingPage onSwitchToAdmin={() => setView("admin")} />;
}
