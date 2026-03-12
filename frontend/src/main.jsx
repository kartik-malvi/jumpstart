// main.jsx (or App.jsx)
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { PackageProvider } from "./context/PackageContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <PackageProvider>
        <App />
      </PackageProvider>
    </AuthProvider>
  </React.StrictMode>
);
