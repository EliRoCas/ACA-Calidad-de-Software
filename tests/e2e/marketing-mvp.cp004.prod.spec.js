const { expect, test } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");
const { captureEvidence } = require("./helpers/evidence");
const { MarketingMvpPage } = require("./pages/MarketingMvpPage");

const googleFormEndpoint =
  "https://docs.google.com/forms/u/0/d/e/1FAIpQLSfw40ns2QRcxUkOCcr_TLcW1asygUr9yENC5wKubVRAxWZHSg/formResponse";

test.describe("CP-004 - integracion con Google Forms y smoke productivo @mvp @cp004 @cp004-prod", () => {
  test.skip(
    process.env.TEST_ENV !== "prod" || process.env.MVP_PROD_SMOKE_ENABLED !== "true",
    "CP-004 modo productivo deshabilitado. Usa TEST_ENV=prod y MVP_PROD_SMOKE_ENABLED=true.",
  );

  test("CP-004 - integracion con Google Forms y smoke productivo (modo productivo/smoke)", async ({ page }, testInfo) => {
    const form = new MarketingMvpPage(page);
    const email = `qa.test.${Date.now()}@example.com`;

    process.env.MVP_GOOGLE_SUBMIT_MODE = "real";

    await form.goto(process.env.MVP_PROD_URL || "/");
    await form.fillValidLeadData({
      firstName: "QA Test",
      lastName: "Automatizado",
      email,
    });
    const validDataEvidence = await captureEvidence(
      page,
      testInfo,
      "mvp-10-cp004-productivo-datos-validos",
    );

    const googleRequest = page.waitForRequest((request) => {
      return request.method() === "POST" && request.url() === googleFormEndpoint;
    });

    await form.submit();
    const request = await googleRequest;

    await expect(
      page.getByText(/envio mvp realizado|revisa google forms/i),
    ).toBeVisible();
    const confirmationEvidence = await captureEvidence(
      page,
      testInfo,
      "mvp-11-cp004-productivo-confirmacion",
    );

    await writeCp004ProductiveSummary({
      email,
      request,
      validDataEvidence,
      confirmationEvidence,
    });
  });
});

async function writeCp004ProductiveSummary({
  email,
  request,
  validDataEvidence,
  confirmationEvidence,
}) {
  const reportsDirectory = path.resolve(__dirname, "..", "..", "docs", "testing");
  const outputPath = path.join(
    reportsDirectory,
    "cp004-productivo-smoke-execution-summary.md",
  );
  const relativeEvidence = (filePath) =>
    path.relative(path.resolve(__dirname, "..", ".."), filePath).replaceAll("\\", "/");
  const values = Object.fromEntries(new URLSearchParams(request.postData() || ""));

  await fs.promises.mkdir(reportsDirectory, { recursive: true });
  await fs.promises.writeFile(
    outputPath,
    [
      "# CP-004 - Resumen de ejecucion productiva/smoke",
      "",
      "| Campo | Resultado |",
      "|---|---|",
      `| Fecha de ejecucion | ${new Date().toISOString()} |`,
      "| Modo | Productivo/smoke |",
      "| Estado | Aprobado |",
      `| Endpoint | ${request.url()} |`,
      `| Metodo HTTP | ${request.method()} |`,
      "| Nombre | QA Test |",
      "| Apellido | Automatizado |",
      `| Correo | ${email} |`,
      "| Resultado esperado | El formulario carga, permite completar datos validos y ejecuta el envio sin error critico. |",
      "| Resultado obtenido | Se capturo el POST hacia Google Forms y el formulario mostro confirmacion funcional de envio. |",
      "",
      "## Valores enviados observados",
      "",
      "| Codigo entry | Valor |",
      "|---|---|",
      ...Object.entries(values).map(([key, value]) => `| \`${key}\` | ${value} |`),
      "",
      "## Evidencias",
      "",
      `- Datos validos antes del envio: \`${relativeEvidence(validDataEvidence)}\``,
      `- Confirmacion posterior al envio: \`${relativeEvidence(confirmationEvidence)}\``,
      "",
      "## Nota",
      "",
      "Este resumen corresponde al modo productivo/smoke de CP-004. La validacion profunda de mapeo `entry.*` se conserva en el modo local/controlado para evitar registros reales innecesarios.",
      "",
    ].join("\n"),
    "utf8",
  );
}
