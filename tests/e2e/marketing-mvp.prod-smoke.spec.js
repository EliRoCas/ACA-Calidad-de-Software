const { expect, test } = require("@playwright/test");
const { captureEvidence } = require("./helpers/evidence");
const { MarketingMvpPage } = require("./pages/MarketingMvpPage");

const googleFormEndpoint =
  "https://docs.google.com/forms/u/0/d/e/1FAIpQLSfw40ns2QRcxUkOCcr_TLcW1asygUr9yENC5wKubVRAxWZHSg/formResponse";

test.describe("Smoke productivo Google @mvp @prod-smoke", () => {
  test.skip(
    process.env.TEST_ENV !== "prod" || process.env.MVP_PROD_SMOKE_ENABLED !== "true",
    "Smoke productivo deshabilitado. Usa TEST_ENV=prod y MVP_PROD_SMOKE_ENABLED=true.",
  );

  test("envia lead valido al endpoint Google configurado", async ({ page }, testInfo) => {
    const form = new MarketingMvpPage(page);

    process.env.MVP_GOOGLE_SUBMIT_MODE = "real";

    await form.goto(process.env.MVP_PROD_URL || "/");
    await form.fillValidLeadData({
      firstName: "Smoke",
      lastName: "Academico",
      email: `smoke.mvp.${Date.now()}@example.com`,
    });
    await captureEvidence(page, testInfo, "mvp-06-smoke-google-datos-validos");

    const googleRequest = page.waitForRequest((request) => {
      return request.method() === "POST" && request.url() === googleFormEndpoint;
    });

    await form.submit();
    await googleRequest;

    await expect(
      page.getByText(/envio mvp realizado|revisa google forms/i),
    ).toBeVisible();
    await captureEvidence(page, testInfo, "mvp-07-smoke-google-confirmacion");
  });
});
