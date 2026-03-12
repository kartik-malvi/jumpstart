const escapeHtml = (value) =>
  `${value ?? ""}`
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const getReadinessLabel = (score) => {
  if (score == null) return "Complete assessment";
  if (score >= 80) return "Excellent career readiness";
  if (score >= 60) return "Good career readiness";
  if (score >= 40) return "Moderate readiness";
  return "Keep building skills";
};

const normalizeSectionResults = (testResults = []) =>
  testResults.map((result, index) => {
    const score = result?.score;
    const maxScore = result?.maxScore;
    const fallbackPercent =
      maxScore > 0 && score != null ? Math.round((Number(score) / Number(maxScore)) * 100) : null;

    return {
      id: result?.sectionId || `section-${index + 1}`,
      title: result?.sectionName || result?.testName || `Section ${index + 1}`,
      score: score != null ? Number(score) : null,
      maxScore: maxScore != null ? Number(maxScore) : null,
      percentage: result?.percentage ?? fallbackPercent,
      completedAt: result?.completedAt,
    };
  });

export const buildResultReportModel = ({
  userName = "Student",
  userEmail = "",
  generatedAt = new Date().toISOString(),
  overallScore = null,
  overallPercentile = "",
  testResults = [],
  strengths = [],
  careerRecommendations = [],
  personalityType = null,
}) => {
  const sectionResults = normalizeSectionResults(testResults);
  const topCareer = (careerRecommendations || [])[0] || null;

  return {
    userName,
    userEmail,
    generatedAt,
    overallScore,
    overallPercentile,
    readinessLabel: getReadinessLabel(overallScore),
    sectionResults,
    strengths: strengths || [],
    careerRecommendations: careerRecommendations || [],
    personalityType: personalityType || null,
    topCareer,
  };
};

export const renderResultReportHtml = (report) => {
  const model = buildResultReportModel(report || {});
  const generatedAt = formatDate(model.generatedAt) || formatDate(new Date().toISOString());
  const sectionCards = model.sectionResults.length
    ? model.sectionResults
        .map(
          (sec) => `
            <div class="section-card">
              <p class="section-title">${escapeHtml(sec.title)}</p>
              <p class="muted">Score: ${sec.score != null && sec.maxScore != null ? `${escapeHtml(sec.score)}/${escapeHtml(sec.maxScore)}` : "—"}</p>
              ${sec.percentage != null ? `<p class="accent">${escapeHtml(sec.percentage)}%</p>` : ""}
              ${sec.completedAt ? `<p class="caption">Completed ${escapeHtml(formatDate(sec.completedAt))}</p>` : ""}
            </div>
          `
        )
        .join("")
    : '<p class="muted">No section scores available yet.</p>';

  const strengths = model.strengths.length
    ? model.strengths
        .map(
          (item) => `
            <div class="list-card">
              <div class="row">
                <span>${escapeHtml(item.name)}</span>
                <strong>${escapeHtml(item.value ?? "—")}${item.value != null ? "%" : ""}</strong>
              </div>
              ${item.desc ? `<p class="muted">${escapeHtml(item.desc)}</p>` : ""}
            </div>
          `
        )
        .join("")
    : '<p class="muted">No strengths available.</p>';

  const careers = model.careerRecommendations.length
    ? model.careerRecommendations
        .map(
          (career) => `
            <div class="list-card">
              <div class="row">
                <strong>${escapeHtml(career.title)}</strong>
                ${career.matchPercent != null ? `<span class="pill">${escapeHtml(career.matchPercent)}% Match</span>` : ""}
              </div>
              ${career.description ? `<p class="muted">${escapeHtml(career.description)}</p>` : ""}
              ${
                Array.isArray(career.skills) && career.skills.length
                  ? `<p class="caption">Skills: ${escapeHtml(career.skills.join(", "))}</p>`
                  : ""
              }
            </div>
          `
        )
        .join("")
    : '<p class="muted">No career recommendations available.</p>';

  const personality = model.personalityType?.title
    ? `
      <div class="list-card">
        <div class="row">
          <strong>${escapeHtml(model.personalityType.code || "")} ${model.personalityType.title ? `— ${escapeHtml(model.personalityType.title)}` : ""}</strong>
        </div>
        ${model.personalityType.description ? `<p class="muted">${escapeHtml(model.personalityType.description)}</p>` : ""}
      </div>
    `
    : '<p class="muted">No personality profile available.</p>';

  return `
    <html>
      <head>
        <title>${escapeHtml(model.userName)} Career Report</title>
        <style>
          :root {
            --bg: #f8fafb;
            --card: #ffffff;
            --border: #e2e8f0;
            --text: #0f1729;
            --muted: #64748b;
            --accent: #188b8b;
            --accent-soft: #e8f4f8;
            --warn: #f59f0a;
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: var(--bg);
            color: var(--text);
            font-family: Arial, sans-serif;
          }
          .page {
            max-width: 1080px;
            margin: 0 auto;
            padding: 24px;
          }
          .banner {
            background: var(--accent-soft);
            border-bottom: 1px solid var(--border);
            padding: 10px 0;
            font-size: 14px;
            font-weight: 600;
          }
          .header {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            align-items: flex-start;
            margin: 24px 0;
          }
          .title {
            font-size: 30px;
            margin: 0;
          }
          .muted {
            color: var(--muted);
            margin: 6px 0 0;
            line-height: 1.5;
          }
          .caption {
            color: var(--muted);
            font-size: 12px;
            margin-top: 8px;
          }
          .grid-3 {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
          }
          .grid-4 {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 16px;
          }
          .card, .section-card, .list-card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 18px;
          }
          .metric {
            font-size: 30px;
            font-weight: 700;
            margin: 10px 0 0;
          }
          .accent {
            color: var(--accent);
            font-weight: 700;
            margin-top: 8px;
          }
          .pill {
            background: rgba(24, 139, 139, 0.12);
            color: var(--accent);
            padding: 6px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 700;
          }
          .section-title {
            margin: 0;
            font-weight: 700;
          }
          .section-block {
            margin-top: 24px;
          }
          .section-block h2 {
            margin: 0 0 14px;
            font-size: 20px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            align-items: center;
          }
          @media print {
            body { background: #fff; }
            .page { padding: 0; }
          }
          @media (max-width: 900px) {
            .grid-3, .grid-4 { grid-template-columns: 1fr; }
            .header { flex-direction: column; }
          }
        </style>
      </head>
      <body>
        <div class="banner">
          <div class="page">Detailed career report</div>
        </div>
        <div class="page">
          <div class="header">
            <div>
              <h1 class="title">Your Detailed Career Report</h1>
              <p class="muted">Comprehensive analysis of your career aptitude assessment.</p>
            </div>
            <div>
              <p class="muted"><strong>${escapeHtml(model.userName)}</strong></p>
              ${model.userEmail ? `<p class="muted">${escapeHtml(model.userEmail)}</p>` : ""}
              <p class="caption">Generated ${escapeHtml(generatedAt)}</p>
            </div>
          </div>

          <div class="grid-3">
            <div class="card">
              <p class="muted">Overall Score</p>
              <p class="metric">${model.overallScore != null ? `${escapeHtml(model.overallScore)}/100` : "—"}</p>
              <p class="muted">${escapeHtml(model.readinessLabel)}</p>
            </div>
            <div class="card">
              <p class="muted">Top Category</p>
              <p class="metric" style="font-size:22px;">${escapeHtml(model.topCareer?.category || model.topCareer?.title || model.strengths?.[0]?.name || "—")}</p>
              <p class="muted">${escapeHtml(model.topCareer?.description || model.strengths?.[0]?.desc || "Strong analytical and problem-solving skills")}</p>
            </div>
            <div class="card">
              <p class="muted">Best Fit</p>
              <p class="metric" style="font-size:22px;">${escapeHtml(model.topCareer?.title || "—")}</p>
              <p class="accent">${model.topCareer?.matchPercent != null ? `${escapeHtml(model.topCareer.matchPercent)}% match with your profile` : "Complete tests to see match"}</p>
            </div>
          </div>

          <div class="section-block">
            <h2>Section Results</h2>
            <div class="grid-4">${sectionCards}</div>
          </div>

          <div class="section-block">
            <h2>Personality Profile</h2>
            ${personality}
          </div>

          <div class="section-block">
            <h2>Your Strengths</h2>
            ${strengths}
          </div>

          <div class="section-block">
            <h2>Career Paths</h2>
            ${careers}
          </div>

          <div class="section-block">
            <h2>Next Steps</h2>
            <div class="list-card">
              <p><strong>1.</strong> Book counselling to discuss the report in depth.</p>
              <p><strong>2.</strong> Explore the highest-match career paths first.</p>
              <p><strong>3.</strong> Build an action plan with concrete next milestones.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

const openReportWindow = (report, shouldPrint = false) => {
  const popup = window.open("", "_blank", "noopener,noreferrer,width=1100,height=800");
  if (!popup) return false;

  popup.document.write(renderResultReportHtml(report));
  popup.document.close();
  popup.focus();

  if (shouldPrint) {
    popup.onload = () => popup.print();
  }

  return true;
};

export const openResultReportPreview = (report) => openReportWindow(report, false);

export const openResultReportPdf = (report) => openReportWindow(report, true);
