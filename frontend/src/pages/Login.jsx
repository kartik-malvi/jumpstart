import React, { useState, useContext, useCallback } from "react";
import logo from "../assets/logo.png";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import GoogleAuthButton from "../components/GoogleAuthButton";
import PasswordField from "../components/PasswordField";

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
  const handleGoogleResponse = useCallback(async (response) => {
    try {
      const id_token = response.credential;

      await loginWithGoogle(id_token);

      navigate("/dashboard");
    } catch (err) {
      console.error("Google Login Error:", err);
      setError(err.message || "Google Login Failed");
    }
  }, [loginWithGoogle, navigate]);

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

            <PasswordField
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-4"
              labelClassName="block text-sm mb-1 font-medium"
              inputClassName="w-full border p-3 pr-12 rounded-lg"
              required
              autoComplete="current-password"
            />

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white p-3 rounded-lg"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <Link to="/forgot-password" className="mt-3 inline-block text-sm font-medium text-[#188B8B] hover:underline">
            Forgot password?
          </Link>

          {/* GOOGLE LOGIN BUTTON */}
          <GoogleAuthButton
            elementId="google-btn"
            onCredential={handleGoogleResponse}
            onConfigError={setError}
            text="signin_with"
          />

          <p className="text-center mt-6 text-sm">
            Don’t have an account?{" "}
            <Link to="/signup" className="font-semibold hover:underline">Sign up</Link>
          </p>
        </div>

        <div className="hidden md:block bg-[#C3EBEB]"></div>
      </div>

    </>
  );
}
