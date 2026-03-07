import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    badge: { type: String, default: "Recommended" },
    amount: { type: Number, required: true, min: 0 },
    strikeAmount: { type: Number, default: null },
    features: [{ type: String }],
    durationText: { type: String, default: "" },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    sections: [
      {
        sectionId: { type: Number, required: true },
        title: { type: String, required: true },
        durationMinutes: { type: Number, default: 20 },
        enabled: { type: Boolean, default: true },
        scoringType: { type: String, enum: ["likert", "objective", "mixed"], default: "mixed" },
        sheetCsvUrl: { type: String, default: "" },
        questions: [
          {
            questionId: { type: String, default: "" },
            text: { type: String, required: true },
            type: { type: String, enum: ["likert", "single"], default: "likert" },
            options: [{ type: String }],
            correctOption: { type: String, default: "" },
            reverseScored: { type: Boolean, default: false },
            weight: { type: Number, default: 1, min: 0.1 },
          },
        ],
      },
    ],
  },
  { _id: false }
);

const assessmentConfigSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    packages: [packageSchema],
  },
  { timestamps: true }
);

const DEFAULT_CONFIG = {
  key: "default",
  packages: [
    {
      id: "starter",
      title: "Starter Package",
      badge: "Recommended",
      amount: 1499,
      strikeAmount: null,
      features: [
        "Complete 5-section assessment",
        "Personalized report",
        "Dashboard access",
      ],
      durationText: "Total duration based on selected sections",
      active: true,
      sortOrder: 1,
      sections: [],
    },
  ],
};

assessmentConfigSchema.statics.getOrCreateDefault = async function getOrCreateDefault() {
  await this.updateOne(
    { key: "default" },
    { $setOnInsert: DEFAULT_CONFIG },
    { upsert: true }
  );
  return this.findOne({ key: "default" });
};

export default mongoose.model("AssessmentConfig", assessmentConfigSchema);
