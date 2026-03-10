import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";

const googleClient = process.env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  : null;

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/v1/user/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, password_confirmation, mobile } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    if (password !== password_confirmation) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      mobile: (mobile || "").toString().trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Signup successful!",
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Signup failed",
    });
  }
};

// POST /api/v1/user/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        msg: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        msg: "Invalid email or password",
      });
    }

    if (!user.password) {
      return res.status(401).json({
        success: false,
        msg: "Please sign in with Google",
      });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({
        success: false,
        msg: "Invalid email or password",
      });
    }

    user.lastLoginAt = new Date();
    user.activities = user.activities || [];
    user.activities.push({
      action: "Logged in",
      status: "Completed",
      type: "auth",
      createdAt: new Date(),
    });
    if (user.activities.length > 100) user.activities = user.activities.slice(-100);
    await user.save();

    const token = signToken(user._id);
    const userObj = user.toAuthJSON();

    return res.status(200).json({
      success: true,
      data: {
        user: userObj,
        auth_token: token,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      msg: err.message || "Login failed",
    });
  }
};

// POST /api/v1/user/auth/social-login
export const socialLogin = async (req, res) => {
  try {
    const { provider, token: idToken } = req.body;

    if (provider !== "google" || !idToken) {
      return res.status(400).json({
        success: false,
        msg: "Provider and token are required",
      });
    }

    if (!googleClient) {
      return res.status(503).json({
        success: false,
        msg: "Google login is not configured",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = (payload.email || "").toLowerCase();
    const name = payload.name || payload.email || "User";
    const avatar = payload.picture || null;

    if (!email) {
      return res.status(400).json({
        success: false,
        msg: "Google account must have an email",
      });
    }

    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = avatar;
        if (!user.name) user.name = name;
        await user.save();
      }
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        avatar,
        password: null,
      });
    }

    user.lastLoginAt = new Date();
    user.activities = user.activities || [];
    user.activities.push({
      action: "Logged in with Google",
      status: "Completed",
      type: "auth",
      createdAt: new Date(),
    });
    if (user.activities.length > 100) user.activities = user.activities.slice(-100);
    await user.save();

    const authToken = signToken(user._id);
    const userObj = user.toAuthJSON();

    return res.status(200).json({
      success: true,
      data: {
        user: userObj,
        auth_token: authToken,
      },
    });
  } catch (err) {
    console.error("Social login error:", err);
    res.status(500).json({
      success: false,
      msg: err.message || "Google login failed",
    });
  }
};
