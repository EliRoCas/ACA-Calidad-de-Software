const { expect } = require("@playwright/test");
const { validLead } = require("../fixtures/marketing-mvp.fixture");

class MarketingMvpPage {
  constructor(page) {
    this.page = page;
    this.googleSubmissions = [];
  }

  field(id) {
    return this.page.locator(`#${id}`);
  }

  async goto(route = "/") {
    await this.installGoogleSubmitCapture();
    await this.installVueCdnFallback();
    await this.page.goto(route);
    await expect(this.field("first_name")).toBeVisible();
    await expect(this.field("tipo_doc")).toBeVisible();
  }

  async installGoogleSubmitCapture() {
    if (process.env.MVP_GOOGLE_SUBMIT_MODE === "real") {
      return;
    }

    await this.page.route("https://docs.google.com/forms/**", async (route) => {
      const request = route.request();
      const postData = request.postData() || "";

      this.googleSubmissions.push({
        method: request.method(),
        url: request.url(),
        postData,
        values: Object.fromEntries(new URLSearchParams(postData)),
      });

      await route.fulfill({ status: 200, body: "" });
    });
  }

  async installVueCdnFallback() {
    const localVue = process.env.VUE_GLOBAL_PROD_PATH;

    if (!localVue) return;

    await this.page.route("https://unpkg.com/vue@3/dist/vue.global.prod.js", async (route) => {
      await route.fulfill({ path: localVue, contentType: "application/javascript" });
    });
  }

  async submitButton() {
    return this.page.getByRole("button", { name: /enviar mvp/i });
  }

  async expectNoValidationErrors() {
    await expect(this.page.locator("ul li")).toHaveCount(0);
    await expect(this.page.locator(".is-invalid")).toHaveCount(0);
  }

  async expectAuthorizationBlocksSubmit() {
    await expect(await this.submitButton()).toBeDisabled();
  }

  async authorize() {
    await this.field("data_authorization").check();
  }

  async submit() {
    await (await this.submitButton()).click();
  }

  async expectSubmitBlocked() {
    await expect(this.page.getByText(/revisa los campos obligatorios/i)).toBeVisible();
    await expect(this.page.locator("pre").last()).not.toContainText('"formId"');
  }

  async expectErrorsFor(labels) {
    for (const label of labels) {
      await expect(this.page.locator("li", { hasText: label }).first()).toBeVisible();
    }
  }

  fieldGroup(id) {
    return this.page.locator(".field-group").filter({ has: this.field(id) });
  }

  async fillInvalidLeadData() {
    await this.field("first_name").fill("Laura123");
    await expect(this.field("first_name")).toHaveValue("Laura");
    await this.field("last_name").fill("Suarez456");
    await expect(this.field("last_name")).toHaveValue("Suarez");
    await this.select("tipo_doc", "CC");
    await this.field("numero_doc").fill("ABC!*");
    await expect(this.field("numero_doc")).toHaveValue("");
    await this.field("mobile").fill("abc---");
    await expect(this.field("mobile")).toHaveValue("");
    await this.field("email").fill("dev@@gmail.com");
  }

  async fillValidLeadData(overrides = {}) {
    const data = { ...validLead, ...overrides };

    await this.field("first_name").fill(data.firstName);
    await this.field("last_name").fill(data.lastName);
    await this.select("tipo_doc", data.documentType);
    await this.field("numero_doc").fill(data.documentNumber);
    await this.select("prefijoCel", data.phonePrefix);
    await this.field("mobile").fill(data.mobile);
    await this.field("email").fill(data.email);
    await this.select("country_residence", data.country);
    await this.select("department", data.department);
    await this.select("city", data.city);
    await this.select("tipo_asistente", data.attendeeType);
    await this.select("nivelacademico", data.academicLevel);
    await this.select("facultad", data.faculty);
    await this.select("programa_principal", data.program);
    await this.select("periodo_esperado", data.period);
    await this.authorize();
  }

  async select(id, value) {
    const control = this.field(id);
    await expect(control).toBeVisible();
    await expect
      .poll(async () => control.locator(`option[value="${value}"]`).count())
      .toBeGreaterThan(0);
    await control.selectOption(value);
  }

  async optionValues(id) {
    return this.field(id).locator("option").evaluateAll((options) =>
      options
        .map((option) => option.value)
        .filter(Boolean),
    );
  }

  async expectHiddenFields(expectedValues = {}) {
    for (const [name, expected] of Object.entries(expectedValues)) {
      await expect(this.page.locator(`input[type="hidden"][name="${name}"]`)).toHaveValue(
        expected,
      );
    }
  }

  async expectPayloadContains(expectedValues = {}) {
    const payload = this.page.locator("pre", { hasText: '"formId"' });
    await expect(payload).toBeVisible();

    for (const [key, value] of Object.entries(expectedValues)) {
      await expect(payload).toContainText(`"${key}": "${value}"`);
    }
  }

  lastGoogleFormSubmission() {
    return this.googleSubmissions.at(-1);
  }
}

module.exports = {
  MarketingMvpPage,
};
