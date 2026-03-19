import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    id: { type: String },
    text: { type: String, required: true, trim: true },
    questionType: {
      type: String,
      enum: ["likert5", "hspq_abc", "objective"],
      default: "likert5",
    },
    dimension: { type: String, default: "" },
    subsection: { type: String, default: "" },
    reverseScored: { type: Boolean, default: false },
    correctOption: { type: Number, default: null },
    marks: { type: Number, default: 1 },
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    durationMinutes: { type: Number, default: 20 },
    questions: { type: [questionSchema], default: [] },
  },
  { _id: false }
);

const packageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    priceLabel: { type: String, default: "" },
    price: { type: Number, default: 0 },
    displayPrice: { type: String, default: "" },
    features: { type: String, default: "" },
    description: { type: String, default: "" },
    pdfQuestion: { type: String, default: "" },
    answerKeyPdf: { type: String, default: "" },
    isActive: { type: Boolean, default: false },
    isDefault: { type: Boolean, default: false },
    status: { type: String, default: "Active" },
    sections: { type: [sectionSchema], default: [] },
  },
  { timestamps: true }
);

const PackageConfig = mongoose.model("PackageConfig", packageSchema);

export default PackageConfig;
