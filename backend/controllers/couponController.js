import Coupon from "../models/Coupon.js";

const formatDiscountLabel = (coupon) => {
  if (!coupon) return "";
  if (coupon.discountType === "fixed") {
    return `₹${Number(coupon.value || 0).toLocaleString("en-IN")}`;
  }
  return `${Number(coupon.value || 0)}%`;
};

const transform = (coupon) => ({
  id: coupon._id,
  code: coupon.code,
  discount: formatDiscountLabel(coupon),
  validUntil: coupon.validUntil ? coupon.validUntil.toISOString().split("T")[0] : null,
  maxUses: coupon.maxUses,
  uses: coupon.uses,
  isActive: coupon.isActive,
  note: coupon.note,
});

export const listCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, data: { coupons: coupons.map(transform) } });
  } catch (err) {
    console.error("List coupons error:", err);
    return res.status(500).json({ success: false, msg: err.message || "Failed to load coupons" });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const { code, discountType, value, validUntil, maxUses, note } = req.body;
    if (!code || !value) {
      return res.status(400).json({ success: false, msg: "Code and value are required" });
    }
    const normalizedCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: normalizedCode });
    if (existing) {
      return res.status(409).json({ success: false, msg: "Coupon code already exists" });
    }
    const coupon = await Coupon.create({
      code: normalizedCode,
      discountType: discountType === "fixed" ? "fixed" : "percentage",
      value: Number(value) || 0,
      validUntil: validUntil ? new Date(validUntil) : null,
      maxUses: maxUses ? Number(maxUses) : null,
      note: note || "",
      isActive: true,
    });
    return res.status(201).json({ success: true, data: { coupon: transform(coupon) } });
  } catch (err) {
    console.error("Create coupon error:", err);
    return res.status(500).json({ success: false, msg: err.message || "Failed to save coupon" });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    if (!couponId) {
      return res.status(400).json({ success: false, msg: "Coupon ID is required" });
    }
    await Coupon.findByIdAndDelete(couponId);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Delete coupon error:", err);
    return res.status(500).json({ success: false, msg: err.message || "Failed to delete coupon" });
  }
};
