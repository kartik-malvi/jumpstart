import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  // Still checking localStorage → avoid white screen
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-lg">
        Loading...
      </div>
    );
  }

  // No logged-in user → force login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in → show the page
  return children;
}
