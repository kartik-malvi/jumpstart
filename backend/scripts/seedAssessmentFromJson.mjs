import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import AssessmentConfig from "../models/AssessmentConfig.js";

async function run() {
  const filePath = path.resolve(process.cwd(), "config/assessment-seed.json");
  if (!fs.existsSync(filePath)) {
    console.error("Seed file not found:", filePath);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const payload = JSON.parse(raw);

  await mongoose.connect(process.env.MONGODB_URI);
  const cfg = await AssessmentConfig.getOrCreateDefault();

  const mappedSections = Array.isArray(payload.sections)
    ? payload.sections.map((s) => ({
      sectionId: Number(s.sectionId),
      title: s.title,
      durationMinutes: Number(s.durationMinutes || 20),
      enabled: s.enabled !== false,
      scoringType: s.scoringType || "mixed",
      sheetCsvUrl: s.sheetCsvUrl || "",
      questions: Array.isArray(s.questions)
        ? s.questions
            .map((q, idx) => ({
              questionId: q.questionId || q.question_id || `${idx + 1}`,
              text: q.text || q.question || "",
              type: q.type || "likert",
              options: q.options || [q.option_a, q.option_b, q.option_c, q.option_d, q.option_e].filter(Boolean),
              correctOption: q.correctOption || q.correct_option || "",
              reverseScored:
                q.reverseScored === true ||
                String(q.reverse_scored || "").toLowerCase() === "true",
              weight: Number(q.weight || 1),
            }))
            .filter((q) => q.text)
        : [],
    }))
    : [];

  cfg.packages = [
    {
      id: "starter",
      title: "Starter Package",
      badge: "Recommended",
      amount: 1499,
      strikeAmount: null,
      features: ["Complete assessment", "Personalized report", "Dashboard access"],
      durationText: "Duration based on selected sections",
      active: true,
      sortOrder: 1,
      sections: mappedSections,
    },
  ];

  await cfg.save();
  console.log(
    "Seeded config:",
    (cfg.packages?.[0]?.sections || []).map((s) => `${s.sectionId}:${s.questions.length}`).join(", ")
  );
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
