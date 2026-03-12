const escapeCsv = (value) => {
  const text = `${value ?? ""}`.replace(/"/g, '""');
  return /[",\n]/.test(text) ? `"${text}"` : text;
};

export const downloadCsv = (filename, rows) => {
  if (!rows || rows.length === 0) return;
  const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const openPrintPdf = (title, sections) => {
  const popup = window.open("", "_blank", "noopener,noreferrer,width=980,height=720");
  if (!popup) return false;

  const sectionHtml = sections
    .map(
      (section) => `
        <section style="margin-bottom: 24px;">
          <h2 style="font-size: 18px; margin: 0 0 8px;">${section.title}</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                ${section.headers.map((header) => `<th style="text-align:left; border-bottom:1px solid #cbd5e1; padding:8px; font-size:12px;">${header}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${section.rows
                .map(
                  (row) => `
                    <tr>
                      ${row.map((cell) => `<td style="border-bottom:1px solid #e2e8f0; padding:8px; font-size:12px;">${cell ?? ""}</td>`).join("")}
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </section>
      `
    )
    .join("");

  popup.document.write(`
    <html>
      <head>
        <title>${title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; padding: 32px; color: #0f172a;">
        <h1 style="margin-top: 0;">${title}</h1>
        <p style="color: #475569;">Generated on ${new Date().toLocaleString("en-IN")}</p>
        ${sectionHtml}
      </body>
    </html>
  `);
  popup.document.close();
  popup.focus();
  popup.print();
  return true;
};
