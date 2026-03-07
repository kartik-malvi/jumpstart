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
    isSuspended: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: null },
    selectedPackageId: { type: String, default: "" },
    purchasedPackages: [{ type: String }],

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
          testName: String,
          completedAt: Date,
          score: Number,
          maxScore: Number,
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
      sectionId: { type: Number, default: 1 },
      questionIndex: { type: Number, default: 0 },
      answers: { type: mongoose.Schema.Types.Mixed, default: {} },
      completedSectionIds: { type: [Number], default: [] },
      timeRemainingSeconds: { type: Number, default: null },
      updatedAt: { type: Date, default: null },
    },
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
    isSuspended: this.isSuspended || false,
    lastLoginAt: this.lastLoginAt || null,
    selectedPackageId: this.selectedPackageId || "",
  };
};

export default mongoose.model("User", userSchema);
