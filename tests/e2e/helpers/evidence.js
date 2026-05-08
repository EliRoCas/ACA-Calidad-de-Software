const fs = require("node:fs");
const path = require("node:path");

const evidenceDirectory = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "docs",
  "testing",
  "evidence",
);

async function captureEvidence(page, testInfo, name) {
  await fs.promises.mkdir(evidenceDirectory, { recursive: true });

  const fileName = `${sanitizeFileName(name)}.png`;
  const filePath = path.join(evidenceDirectory, fileName);

  await page.screenshot({
    path: filePath,
    fullPage: true,
  });

  await testInfo.attach(name, {
    path: filePath,
    contentType: "image/png",
  });

  return filePath;
}

function sanitizeFileName(value) {
  return String(value)
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
}

module.exports = {
  captureEvidence,
  evidenceDirectory,
};
