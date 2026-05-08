const fs = require("node:fs");
const path = require("node:path");
const { expect, test } = require("@playwright/test");
const { hiddenFields, validLead } = require("./fixtures/marketing-mvp.fixture");
const { captureEvidence } = require("./helpers/evidence");
const { MarketingMvpPage } = require("./pages/MarketingMvpPage");

test.describe("Formulario Marketing MVP @mvp @local", () => {
  test("bloquea envio invalido y muestra validaciones solo despues de interaccion @validation", async ({
    page,
  }, testInfo) => {
    const form = new MarketingMvpPage(page);

    await form.goto("/");
    await form.expectNoValidationErrors();
    await form.expectAuthorizationBlocksSubmit();
    await captureEvidence(page, testInfo, "mvp-01-render-inicial-sin-errores");

    await form.authorize();
    await form.submit();
    await form.expectSubmitBlocked();
    await form.expectErrorsFor([
      "Nombre",
      "Apellido",
      "Tipo de documento",
      "Numero de documento",
      "Telefono",
      "Email",
    ]);
    await captureEvidence(page, testInfo, "mvp-02-validaciones-obligatorias");

    await form.fillInvalidLeadData();
    await form.submit();
    await form.expectSubmitBlocked();
    await expect(form.fieldGroup("email")).toHaveClass(/is-invalid/);
    await captureEvidence(page, testInfo, "mvp-03-bloqueo-datos-invalidos");
  });

  test("carga flujo academico desde JSON y conserva campos ocultos @integration", async ({
    page,
  }, testInfo) => {
    const form = new MarketingMvpPage(page);
    const programas = readJson("MOCK/JSON/programas.json");
    const periodos = readJson("MOCK/JSON/periodos.json");

    await form.goto(
      "/?utm_source=academico&utm_medium=qa&utm_campaign=mvp&fevento=2026-12-01,%209pm",
    );

    await expect
      .poll(async () => form.optionValues("nivelacademico"))
      .toEqual(expect.arrayContaining(Object.keys(programas)));

    await form.select("nivelacademico", validLead.academicLevel);
    await expect
      .poll(async () => form.optionValues("facultad"))
      .toEqual(expect.arrayContaining(Object.keys(programas[validLead.academicLevel])));

    await form.select("facultad", validLead.faculty);
    await expect
      .poll(async () => form.optionValues("programa_principal"))
      .toEqual(
        expect.arrayContaining(
          programas[validLead.academicLevel][validLead.faculty].Programas.map(
            (program) => program.Codigo,
          ),
        ),
      );

    await form.select("programa_principal", validLead.program);
    await expect
      .poll(async () => form.optionValues("periodo_esperado"))
      .toEqual(expect.arrayContaining(Object.values(periodos[validLead.academicLevel])));
    await captureEvidence(page, testInfo, "mvp-04-flujo-academico-json");

    for (const field of hiddenFields) {
      await expect(page.locator(`input[type="hidden"][name="${field}"]`)).toHaveCount(1);
    }

    await form.expectHiddenFields({
      utm_source: "marketing_mvp",
      nevento: "Marketing MVP",
      fevento: "01/12/2026, 09:00 p.\u00A0m.",
    });

    await form.fillValidLeadData();
    await form.submit();
    await form.expectPayloadContains({
      programa_principal: validLead.program,
      periodo_esperado: validLead.period,
      fevento: "01/12/2026, 09:00 p.\u00A0m.",
    });
    await captureEvidence(page, testInfo, "mvp-05-payload-final-y-campos-ocultos");
  });
});

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "..", relativePath), "utf8"));
}
