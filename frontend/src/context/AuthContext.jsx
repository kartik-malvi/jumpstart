import { createContext, useState, useEffect } from "react";
import api from "../api/api";

export const AuthContext = createContext();

// ----------------------------
// SAFE GET FROM LOCAL STORAGE
// ----------------------------
const getStoredUser = () => {
  try {
    const saved = localStorage.getItem("user");
    if (!saved || saved === "undefined") return null;
    return JSON.parse(saved);
  } catch {
    return null;
  }
};

const getStoredToken = () => {
  const saved = localStorage.getItem("token");
  if (!saved || saved === "undefined") return "";
  return saved;
};

// ----------------------------
// AUTH PROVIDER
// ----------------------------
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [token, setToken] = useState(getStoredToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getStoredUser();
    const t = getStoredToken();

    if (u && t) {
      setUser(u);
      setToken(t);
    }

    setLoading(false);
  }, []);

  // ------------------------------------
  // 1️⃣ LOGIN WITH EMAIL + PASSWORD
  // ------------------------------------
  const login = async ({ email, password }) => {
    try {
      const res = await api.post("/v1/user/auth/login", { email, password });
      const data = res?.data || {};
      console.log("LOGIN RESPONSE:", data);

      if (!data.success) {
        throw new Error(data.msg || "Login failed");
      }

      const userObj = data.data.user;
      const tokenStr = data.data.auth_token;

      if (!tokenStr) throw new Error("No token received");

      setUser(userObj);
      setToken(tokenStr);

      localStorage.setItem("user", JSON.stringify(userObj));
      localStorage.setItem("token", tokenStr);

      return data;
    } catch (err) {
      throw new Error(err?.response?.data?.msg || err?.response?.data?.message || err.message || "Login failed");
    }
  };

  // ------------------------------------
  // 2️⃣ LOGIN WITH GOOGLE (SOCIAL LOGIN)
  // ------------------------------------
  const loginWithGoogle = async (google_id_token) => {
    try {
      const res = await api.post("/v1/user/auth/social-login", {
        provider: "google",
        token: google_id_token,
      });
      const data = res?.data || {};
      console.log("GOOGLE LOGIN RESPONSE:", data);

      if (!data.success) {
        throw new Error(data.msg || "Google login failed");
      }

      const userObj = data.data?.user;
      const tokenStr = data.data?.auth_token;

      if (!tokenStr) throw new Error("No token received");

      setUser(userObj);
      setToken(tokenStr);

      localStorage.setItem("user", JSON.stringify(userObj));
      localStorage.setItem("token", tokenStr);

      return data;
    } catch (err) {
      throw new Error(
        err?.response?.data?.msg || err?.response?.data?.message || err.message || "Google login failed"
      );
    }
  };

  // ------------------------------------
  // 3️⃣ LOGOUT
  // ------------------------------------
  const logout = () => {
    setUser(null);
    setToken("");

    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        loginWithGoogle, // <-- Added Google Login
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
