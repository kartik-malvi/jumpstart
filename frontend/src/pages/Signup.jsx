import React, { useState, useEffect, useContext } from "react";
import GoogleIcon from "../assets/Social-icon.png";
import logo from "../assets/logo.png";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const basePath = `${apiBase}/v1`;
const GOOGLE_CLIENT_ID =
  "773594743314-9n0eb71lufvvh4utldar312r8meh2mji.apps.googleusercontent.com";

export default function Signup() {
  const navigate = useNavigate();
  const { loginWithGoogle } = useContext(AuthContext);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  // ------------------------------------------------
  // GOOGLE SIGNUP HANDLER
  // ------------------------------------------------
  const handleGoogleResponse = async (response) => {
    try {
      const id_token = response.credential;

      await loginWithGoogle(id_token);

      navigate("/dashboard");
    } catch (err) {
      console.error("Google Signup Error:", err);
      setMsg(err.message || "Google Signup Failed");
    }
  };

  // ------------------------------------------------
  // LOAD GOOGLE SCRIPT + BUTTON
  // ------------------------------------------------
  useEffect(() => {
    const loadScript = () =>
      new Promise((resolve) => {
        if (window.google && window.google.accounts) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = resolve;

        document.body.appendChild(script);
      });

    loadScript().then(() => {
      if (!window.google) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        ux_mode: "popup",
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-signup"),
        { theme: "outline", size: "large", width: "100%" }
      );
    });
  }, []);

  // ------------------------------------------------
  // NORMAL SIGNUP
  // ------------------------------------------------
  const handleSubmit = async () => {
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch(`${basePath}/user/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      console.log("REGISTER RESPONSE:", data);

      if (res.ok) {
        setMsg("Signup successful!");
        setTimeout(() => navigate("/login"), 500);
      } else {
        setMsg(data.message || "Signup failed");
      }
    } catch (error) {
      console.error("SIGNUP ERROR:", error);
      setMsg("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <>
      
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col justify-center px-8 md:px-0 py-10 max-w-[360px] w-full mx-auto">

          <div className="mb-10">
            <img src={logo} alt="logo" />
          </div>

          <h2 className="text-3xl font-bold mb-6">Sign up</h2>

          {/* FORM FIELDS */}
          <div className="mb-5">
            <label className="block text-sm mb-1 font-medium">Name*</label>
            <input
              type="text"
              placeholder="Full name"
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full border p-3 rounded-lg"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm mb-1 font-medium">Mobile*</label>
            <input
              type="number"
              placeholder="Mobile number"
              onChange={(e) => handleChange("mobile", e.target.value)}
              className="w-full border p-3 rounded-lg"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm mb-1 font-medium">Email*</label>
            <input
              type="email"
              placeholder="Email"
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full border p-3 rounded-lg"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-1 font-medium">Password*</label>
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => handleChange("password", e.target.value)}
              className="w-full border p-3 rounded-lg"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-1 font-medium">
              Confirm Password*
            </label>
            <input
              type="password"
              placeholder="Re-enter password"
              onChange={(e) =>
                handleChange("password_confirmation", e.target.value)
              }
              className="w-full border p-3 rounded-lg"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-black text-white p-3 rounded-lg font-semibold hover:bg-gray-900 mt-2 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Get started"}
          </button>

          {/* GOOGLE SIGNUP BUTTON */}
          <div id="google-signup" className="mt-4 w-full"></div>

          {msg && (
            <p className="text-center mt-4 text-sm text-red-600">{msg}</p>
          )}
        </div>

        <div className="hidden md:block bg-[#C3EBEB]"></div>
      </div>

    </>
  );
}
