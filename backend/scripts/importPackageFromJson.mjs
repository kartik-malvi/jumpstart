import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../config/db.js";
import PackageConfig from "../models/PackageConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputArg = process.argv[2];

if (!inputArg) {
  console.error("Usage: node backend/scripts/importPackageFromJson.mjs <json-file>");
  process.exit(1);
}

const inputPath = path.isAbsolute(inputArg) ? inputArg : path.resolve(__dirname, "..", "..", inputArg);

const main = async () => {
  await connectDB();

  const raw = await fs.readFile(inputPath, "utf8");
  const payload = JSON.parse(raw);

  if (!payload?.name || !payload?.slug || !Array.isArray(payload?.sections)) {
    throw new Error("Invalid package JSON: name, slug, and sections are required");
  }

  const existing = await PackageConfig.findOne({ slug: payload.slug });

  if (existing) {
    existing.name = payload.name;
    existing.priceLabel = payload.priceLabel || existing.priceLabel;
    existing.price = Number(payload.price) || existing.price || 0;
    existing.displayPrice = payload.displayPrice || payload.priceLabel || existing.displayPrice;
    existing.features = payload.features || existing.features;
    existing.description = payload.description || existing.description;
    existing.pdfQuestion = payload.pdfQuestion || existing.pdfQuestion;
    existing.answerKeyPdf = payload.answerKeyPdf || existing.answerKeyPdf;
    existing.sections = payload.sections;
    existing.status = payload.status || existing.status || "Draft";
    existing.isActive = !!payload.isActive;
    await existing.save();
    console.log(`Updated package: ${existing.name} (${existing.slug})`);
  } else {
    const created = await PackageConfig.create({
      ...payload,
      price: Number(payload.price) || 0,
      isActive: !!payload.isActive,
      status: payload.status || "Draft",
    });
    console.log(`Created package: ${created.name} (${created.slug})`);
  }

  process.exit(0);
};

main().catch((error) => {
  console.error("Package import failed:", error.message);
  process.exit(1);
});
