import MailList from "../models/MailList.js";

const cleanEntries = (entries = []) =>
  entries
    .map((entry) => ({
      name: (entry.name || "").trim(),
      email: (entry.email || "").trim(),
    }))
    .filter((entry) => entry.email && entry.email.includes("@"));

export const listMailLists = async (req, res) => {
  try {
    const lists = await MailList.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, data: { lists } });
  } catch (err) {
    console.error("List mail lists error:", err);
    return res.status(500).json({ success: false, msg: err.message || "Failed to load mail lists" });
  }
};

export const uploadMailList = async (req, res) => {
  try {
    const { entries = [], label } = req.body;
    const filtered = cleanEntries(entries);
    if (filtered.length === 0) {
      return res.status(400).json({ success: false, msg: "Provide at least one valid email" });
    }
    const doc = await MailList.create({
      label: label || `Mail list - ${new Date().toISOString()}`,
      entries: filtered,
    });
    return res.status(201).json({ success: true, data: { mailList: doc } });
  } catch (err) {
    console.error("Upload mail list error:", err);
    return res.status(500).json({ success: false, msg: err.message || "Failed to save mail list" });
  }
};
