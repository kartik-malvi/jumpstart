import mongoose from "mongoose";

const entrySchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const mailListSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Mail List" },
    entries: { type: [entrySchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("MailList", mailListSchema);
