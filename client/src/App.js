import React from "react";
import BookingPage from "./BookingPage";
import AdminPage from "./AdminPage";
import LoginPage from "./LoginPage";
import { getAuth, clearAuth } from "./auth";

export default function App() {
  const path = window.location.pathname;
  const auth = getAuth();
  const isStaff = auth?.user?.role === "admin" || auth?.user?.role === "employee";

  const logout = () => {
    clearAuth();
    window.location.href = "/";
  };

  if (path === "/login") {
    return <LoginPage />;
  }

  if (path === "/admin") {
    if (!isStaff) {
      window.location.href = "/login";
      return null;
    }
    return <AdminPage user={auth.user} onLogout={logout} />;
  }

  return <BookingPage auth={auth} onLogout={logout} />;
}
