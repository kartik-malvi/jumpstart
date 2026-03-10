import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    value: { type: Number, required: true },
    validUntil: { type: Date },
    maxUses: { type: Number, default: null },
    uses: { type: Number, default: 0 },
    note: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
