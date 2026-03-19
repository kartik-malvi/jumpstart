import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, minlength: 6, default: null },
    mobile: { type: String, trim: true, default: "" },
    googleId: { type: String, sparse: true, default: null },
    avatar: { type: String, default: null },
    subscription: {
      type: String,
      enum: ["Basic", "Standard", "Premium"],
      default: "Basic",
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    status: { type: String, enum: ["Active", "Suspended"], default: "Active" },
    lastLoginAt: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpiresAt: { type: Date, default: null },
    submissionApprovalStatus: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
    submissionApprovedAt: { type: Date, default: null },

    // Dashboard counters
    testsCompleted: { type: Number, default: 0 },
    testsInProgress: { type: Number, default: 0 },
    reportsReady: { type: Number, default: 0 },
    counsellingSessions: { type: Number, default: 0 },

    // Dashboard: per-user available tests (simple structure for now)
    availableTests: [
      {
        title: { type: String, required: true },
        durationMinutes: { type: Number, default: 180 },
        totalQuestions: { type: Number, default: 50 },
        status: {
          type: String,
          enum: ["not_started", "in_progress", "completed"],
          default: "not_started",
        },
      },
    ],

    // Dashboard: top career matches for this user
    topCareers: [
      {
        title: { type: String, required: true },
        matchPercent: { type: Number, required: true },
      },
    ],

    // Results page: per-user career profile (populated after tests)
    resultProfile: {
      overallScore: { type: Number, default: null },
      overallPercentile: { type: String, default: "" },
      completedTestsCount: { type: Number, default: 0 },
      totalTestsCount: { type: Number, default: 0 },
      careerPathwaysCount: { type: Number, default: 0 },
      testResults: [
        {
          sectionId: mongoose.Schema.Types.Mixed,
          sectionName: String,
          testName: String,
          completedAt: Date,
          score: Number,
          maxScore: Number,
          percentage: Number,
          dimensionScores: [
            {
              name: String,
              score: Number,
            },
          ],
          reportUrl: String,
        },
      ],
      strengths: [
        {
          name: String,
          value: Number,
          desc: String,
        },
      ],
      careerRecommendations: [
        {
          title: String,
          matchPercent: Number,
          description: String,
          skills: [String],
          salaryRange: String,
          link: String,
        },
      ],
      personalityType: {
        code: String,
        title: String,
        description: String,
        traits: [{ name: String, value: Number }],
      },
    },

    // Livetest progress (section, question index, answers, time left)
    testProgress: {
      sectionId: { type: mongoose.Schema.Types.Mixed, default: 1 },
      questionIndex: { type: Number, default: 0 },
      answers: { type: mongoose.Schema.Types.Mixed, default: {} },
      timeRemainingSeconds: { type: Number, default: null },
      updatedAt: { type: Date, default: null },
    },

    payments: [
      {
        orderId: { type: String, required: true },
        packageName: { type: String, required: true },
        amount: { type: Number, required: true },
        method: { type: String, enum: ["Card", "UPI", "Net Banking", "Wallet"], default: "UPI" },
        status: { type: String, enum: ["Completed", "Pending", "Failed"], default: "Completed" },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    submissionHistory: [
      {
        submissionId: { type: String, required: true },
        packageName: { type: String, default: "" },
        type: { type: String, default: "Basic" },
        submittedAt: { type: Date, default: Date.now },
        approvedAt: { type: Date, default: null },
        status: {
          type: String,
          enum: ["Submitted", "Approved"],
          default: "Submitted",
        },
        duration: { type: String, default: "--" },
        scoringSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },
        resultProfileSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },
      },
    ],

    activities: [
      {
        action: { type: String, required: true },
        status: { type: String, default: "Completed" },
        type: { type: String, enum: ["payment", "test", "result", "auth", "other"], default: "other" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toAuthJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    mobile: this.mobile || "",
    subscription: this.subscription,
    role: this.role,
  };
};

export default mongoose.model("User", userSchema);
