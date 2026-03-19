import PackageConfig from "../models/PackageConfig.js";

const slugify = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `package-${Date.now()}`;

const normalizeQuestion = (question = {}, qIdx = 0) => ({
  id: question.id || `q-${Date.now()}-${qIdx}`,
  text: (question.text || "").trim(),
  questionType: ["likert5", "hspq_abc", "objective", "profile_choice"].includes(question.questionType)
    ? question.questionType
    : "likert5",
  dimension: question.dimension || "",
  subsection: question.subsection || "",
  reverseScored: !!question.reverseScored,
  options: Array.isArray(question.options)
    ? question.options
        .map((option, index) => ({
          label: (option?.label || "").trim(),
          value: option?.value != null ? Number(option.value) : index + 1,
          score: option?.score != null && option.score !== "" ? Number(option.score) : null,
        }))
        .filter((option) => option.label)
    : [],
  correctOption: question.correctOption != null ? Number(question.correctOption) : null,
  marks: Number(question.marks) || 1,
});

const normalizeSections = (sections = []) =>
  (sections || []).map((section, idx) => ({
    id: section.id || `section-${idx + 1}-${Date.now()}`,
    name: (section.name || `Section ${idx + 1}`).trim(),
    durationMinutes: Number(section.durationMinutes) || 20,
    questions: (section.questions || []).map((q, qIdx) => normalizeQuestion(q, qIdx)),
  }));

const DEFAULT_PACKAGE_DATA = {
  name: "Default PDF Question Package",
  slug: "default-pdf-question-package",
  priceLabel: "₹999",
  price: 999,
  displayPrice: "₹999",
  features: "PDF question set + answer key scoring via Google Sheets",
  description: "Upload your section-wise PDF questions or Google Sheets import to keep the same experience.",
  pdfQuestion: "complete-aptitude-test-500q.pdf",
  answerKeyPdf: "complete-answer-key-500q.pdf",
  isActive: true,
  isDefault: true,
  sections: [],
  status: "Active",
};

const ensureDefaultPackageExists = async () => {
  const count = await PackageConfig.countDocuments();
  if (count === 0) {
    const created = await PackageConfig.create(DEFAULT_PACKAGE_DATA);
    return created.toObject();
  }
  const existing = await PackageConfig.findOne({ isDefault: true }).lean();
  return existing;
};

export const getPackages = async (req, res) => {
  try {
    await ensureDefaultPackageExists();
    const packages = await PackageConfig.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, data: { packages } });
  } catch (err) {
    console.error("Get packages error:", err);
    return res.status(500).json({ success: false, msg: err.message || "Failed to load packages" });
  }
};

export const getActivePackage = async (req, res) => {
  try {
    await ensureDefaultPackageExists();
    const activePackage =
      (await PackageConfig.findOne({ isActive: true }).lean()) ||
      (await PackageConfig.findOne().sort({ createdAt: -1 }).lean());

    return res.status(200).json({
      success: true,
      data: { package: activePackage || DEFAULT_PACKAGE_DATA },
    });
  } catch (err) {
    console.error("Get active package error:", err);
    return res.status(500).json({ success: false, msg: err.message || "Failed to load active package" });
  }
};

export const getPublicPackages = async (req, res) => {
  try {
    await ensureDefaultPackageExists();
    const activePackages = await PackageConfig.find({ isActive: true, status: "Active" }).sort({ createdAt: -1 }).lean();
    const packages = activePackages.length
      ? activePackages
      : [(await PackageConfig.findOne({ isDefault: true }).lean()) || DEFAULT_PACKAGE_DATA];

    return res.status(200).json({
      success: true,
      data: { packages },
    });
  } catch (err) {
    console.error("Get public packages error:", err);
    return res.status(500).json({ success: false, msg: err.message || "Failed to load packages" });
  }
};

export const upsertPackage = async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.name || !payload.priceLabel) {
      return res.status(400).json({ success: false, msg: "Name and price are required" });
    }

    const sections = normalizeSections(payload.sections || []);
    const slug = payload.slug ? slugify(payload.slug) : slugify(payload.name);

    let pkg;
    if (payload.id) {
      pkg = await PackageConfig.findById(payload.id);
      if (!pkg) {
        return res.status(404).json({ success: false, msg: "Package not found" });
      }
      pkg.name = payload.name.trim();
      pkg.priceLabel = payload.priceLabel.trim();
      pkg.price = Number(payload.price) || pkg.price || 0;
      pkg.displayPrice = payload.displayPrice || pkg.displayPrice || payload.priceLabel;
      pkg.features = payload.features || pkg.features;
      pkg.description = payload.description || pkg.description;
      pkg.pdfQuestion = payload.pdfQuestion || pkg.pdfQuestion;
      pkg.answerKeyPdf = payload.answerKeyPdf || pkg.answerKeyPdf;
      pkg.sections = sections;
      pkg.slug = slug;
      pkg.isActive = payload.isActive !== undefined ? !!payload.isActive : pkg.isActive;
      pkg.status = payload.status || pkg.status || "Active";
      await pkg.save();
    } else {
      pkg = await PackageConfig.create({
        name: payload.name.trim(),
        slug,
        priceLabel: payload.priceLabel.trim(),
        price: Number(payload.price) || 0,
        displayPrice: payload.displayPrice || payload.priceLabel,
        features: payload.features || "",
        description: payload.description || "",
        pdfQuestion: payload.pdfQuestion || "",
        answerKeyPdf: payload.answerKeyPdf || "",
      isActive: !!payload.isActive,
      status: payload.status || "Active",
      sections,
    });
    }

    return res.status(200).json({ success: true, data: { package: pkg.toObject() } });
  } catch (err) {
    console.error("Upsert package error:", err);
    return res.status(500).json({ success: false, msg: err.message || "Failed to save package" });
  }
};

export const activatePackage = async (req, res) => {
  try {
    const { packageId } = req.params;
    if (!packageId) return res.status(400).json({ success: false, msg: "Package ID is required" });

    const pkg = await PackageConfig.findById(packageId);
    if (!pkg) return res.status(404).json({ success: false, msg: "Package not found" });
    pkg.isActive = true;
    pkg.status = "Active";
    await pkg.save();

    return res.status(200).json({ success: true, data: { package: pkg.toObject() } });
  } catch (err) {
    console.error("Activate package error:", err);
    return res.status(500).json({ success: false, msg: err.message || "Failed to activate package" });
  }
};

export const deletePackage = async (req, res) => {
  try {
    const { packageId } = req.params;
    if (!packageId) {
      return res.status(400).json({ success: false, msg: "Package ID is required" });
    }

    const pkg = await PackageConfig.findById(packageId);
    if (!pkg) {
      return res.status(404).json({ success: false, msg: "Package not found" });
    }

    if (pkg.isDefault) {
      return res.status(400).json({ success: false, msg: "Default package cannot be deleted" });
    }

    await PackageConfig.deleteOne({ _id: packageId });

    return res.status(200).json({
      success: true,
      data: {
        packageId: String(packageId),
      },
    });
  } catch (err) {
    console.error("Delete package error:", err);
    return res.status(500).json({ success: false, msg: err.message || "Failed to delete package" });
  }
};
