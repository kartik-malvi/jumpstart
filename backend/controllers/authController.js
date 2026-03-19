import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import nodemailer from "nodemailer";
import User from "../models/User.js";

const googleClient = process.env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  : null;

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const buildResetBaseUrl = (req, isAdmin = false) => {
  const explicitBase =
    process.env.APP_BASE_URL ||
    process.env.CLIENT_ORIGIN?.split(",")[0]?.trim() ||
    req.headers.origin ||
    "http://127.0.0.1:5175";

  const normalizedBase = explicitBase.replace(/\/+$/, "");
  return isAdmin ? `${normalizedBase}/service/reset-password` : `${normalizedBase}/reset-password`;
};

const getMailTransport = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true" || Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

const sendResetEmail = async ({ to, resetUrl, isAdmin = false }) => {
  const transport = getMailTransport();
  if (!transport) return false;

  await transport.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: isAdmin ? "Jumpstart admin password reset" : "Jumpstart password reset",
    text: `Use this link to reset your password: ${resetUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; line-height: 1.6; color: #0f1729;">
        <h2>Reset your password</h2>
        <p>Use the link below to set a new password.</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link expires in 1 hour.</p>
      </div>
    `,
  });

  return true;
};

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

    if (user.status === "Suspended") {
      return res.status(403).json({
        success: false,
        msg: "Your account is suspended",
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
      if (user.status === "Suspended") {
        return res.status(403).json({
          success: false,
          msg: "Your account is suspended",
        });
      }
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

export const forgotPassword = async (req, res) => {
  try {
    const email = (req.body.email || "").toLowerCase().trim();
    const isAdmin = !!req.body.isAdmin;

    if (!email) {
      return res.status(400).json({ success: false, msg: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(200).json({
        success: true,
        msg: "If this email exists, a reset link has been sent.",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const resetUrl = `${buildResetBaseUrl(req, isAdmin)}/${rawToken}`;

    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    let emailed = false;
    try {
      emailed = await sendResetEmail({ to: email, resetUrl, isAdmin });
    } catch (mailErr) {
      console.error("Forgot password mail error:", mailErr);
      user.resetPasswordToken = null;
      user.resetPasswordExpiresAt = null;
      await user.save();
      return res.status(502).json({
        success: false,
        msg: "Password reset email could not be sent right now",
      });
    }

    const payload = {
      success: true,
      msg: "If this email exists, a reset link has been sent.",
    };

    if (!emailed) {
      console.log(`[password-reset] Email not configured. Reset link for ${email}: ${resetUrl}`);
      payload.mailConfigured = false;
      if (process.env.NODE_ENV !== "production") payload.devResetUrl = resetUrl;
    }

    return res.status(200).json(payload);
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ success: false, msg: err.message || "Failed to process reset request" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, password_confirmation } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, msg: "Password must be at least 6 characters" });
    }

    if (password !== password_confirmation) {
      return res.status(400).json({ success: false, msg: "Passwords do not match" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ success: false, msg: "Reset link is invalid or expired" });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;
    await user.save();

    return res.status(200).json({ success: true, msg: "Password updated successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ success: false, msg: err.message || "Failed to reset password" });
  }
};
