import React, { useState, useContext, useCallback } from "react";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/api";
import GoogleAuthButton from "../components/GoogleAuthButton";
import PasswordField from "../components/PasswordField";

export default function Signup() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useContext(AuthContext);

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
  const handleGoogleResponse = useCallback(async (response) => {
    try {
      const id_token = response.credential;

      await loginWithGoogle(id_token);

      navigate("/dashboard");
    } catch (err) {
      console.error("Google Signup Error:", err);
      setMsg(err.message || "Google Signup Failed");
    }
  }, [loginWithGoogle, navigate]);

  // ------------------------------------------------
  // NORMAL SIGNUP
  // ------------------------------------------------
  const handleSubmit = async () => {
    setLoading(true);
    setMsg("");

    try {
      const res = await api.post("/v1/user/auth/register", form);
      const data = res?.data || {};
      console.log("REGISTER RESPONSE:", data);

      if (data.success) {
        await login({ email: form.email, password: form.password });
        setMsg("Signup successful!");
        setTimeout(() => navigate("/dashboard"), 300);
      } else {
        setMsg(data.message || "Signup failed");
      }
    } catch (error) {
      console.error("SIGNUP ERROR:", error);
      setMsg(error?.response?.data?.message || error?.response?.data?.msg || "Something went wrong");
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

          <PasswordField
            label="Password*"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            placeholder="Password"
            className="mb-4"
            labelClassName="block text-sm mb-1 font-medium"
            inputClassName="w-full border p-3 pr-12 rounded-lg"
            autoComplete="new-password"
          />

          <PasswordField
            label="Confirm Password*"
            value={form.password_confirmation}
            onChange={(e) => handleChange("password_confirmation", e.target.value)}
            placeholder="Re-enter password"
            className="mb-4"
            labelClassName="block text-sm mb-1 font-medium"
            inputClassName="w-full border p-3 pr-12 rounded-lg"
            autoComplete="new-password"
          />

          {/* SUBMIT BUTTON */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-black text-white p-3 rounded-lg font-semibold hover:bg-gray-900 mt-2 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Get started"}
          </button>

          {/* GOOGLE SIGNUP BUTTON */}
          <GoogleAuthButton
            elementId="google-signup"
            onCredential={handleGoogleResponse}
            onConfigError={setMsg}
            text="signup_with"
          />

          {msg && (
            <p className="text-center mt-4 text-sm text-red-600">{msg}</p>
          )}
        </div>

        <div className="hidden md:block bg-[#C3EBEB]"></div>
      </div>

    </>
  );
}
