import React, { useState, useContext, useEffect } from "react";
import logo from "../assets/logo.png";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function Login() {
  const { login, loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ------------------------------------------------
  // GOOGLE LOGIN CALLBACK
  // ------------------------------------------------
  const handleGoogleResponse = async (response) => {
    try {
      const id_token = response.credential;

      await loginWithGoogle(id_token);

      navigate("/dashboard");
    } catch (err) {
      console.error("Google Login Error:", err);
      setError(err.message || "Google Login Failed");
    }
  };

  // ------------------------------------------------
  // LOAD & INITIALIZE GOOGLE BUTTON
  // ------------------------------------------------
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setError("Google login is not configured");
      return;
    }

    const loadScript = () => {
      return new Promise((resolve, reject) => {
        // If already loaded
        if (window.google && window.google.accounts) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;

        script.onload = () => resolve();
        script.onerror = () => reject("Google script failed to load");

        document.body.appendChild(script);
      });
    };

    loadScript().then(() => {
      if (!window.google || !window.google.accounts) {
        console.error("Google API not available");
        return;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        ux_mode: "popup",
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-btn"),
        { theme: "outline", size: "large", width: "100%" }
      );
    });
  }, []);

  // ------------------------------------------------
  // EMAIL + PASSWORD LOGIN
  // ------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid Credentials");
    }

    setLoading(false);
  };

  return (
    <>

      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col justify-center px-8 py-10 max-w-[360px] w-full mx-auto">
          <img src={logo} className="mb-10" alt="logo" />

          <h2 className="text-3xl font-bold mb-2">Log in</h2>
          <p className="text-gray-500 mb-6">
            Welcome back! Please enter your details.
          </p>

          {/* EMAIL LOGIN FORM */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm mb-1 font-medium">Email</label>
              <input
                type="email"
                className="w-full border p-3 rounded-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-1 font-medium">Password</label>
              <input
                type="password"
                className="w-full border p-3 rounded-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white p-3 rounded-lg"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* GOOGLE LOGIN BUTTON */}
          <div id="google-btn" className="mt-4 w-full"></div>

          <p className="text-center mt-6 text-sm">
            Don’t have an account?{" "}
            <a href="/signup" className="font-semibold hover:underline">
              Sign up
            </a>
          </p>
        </div>

        <div className="hidden md:block bg-[#C3EBEB]"></div>
      </div>

    </>
  );
}
