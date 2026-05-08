const fs = require("node:fs");
const path = require("node:path");
const { expect, test } = require("@playwright/test");
const { hiddenFields, validLead } = require("./fixtures/marketing-mvp.fixture");
const { captureEvidence } = require("./helpers/evidence");
const { MarketingMvpPage } = require("./pages/MarketingMvpPage");

const googleFormEndpoint =
  "https://docs.google.com/forms/u/0/d/e/1FAIpQLSfw40ns2QRcxUkOCcr_TLcW1asygUr9yENC5wKubVRAxWZHSg/formResponse";

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

  test("CP-004 - integracion con Google Forms y smoke productivo (modo local/controlado) @integration @cp004", async ({
    page,
  }, testInfo) => {
    const form = new MarketingMvpPage(page);

    await form.goto(
      "/?utm_source=source&utm_subsource=subsource&utm_medium=medium&utm_campaign=campaign&nevento=Evento%20CP-004&fevento=11/05/2026,%209am",
    );

    await form.fillValidLeadData({
      firstName: "Ana",
      lastName: "P\u00e9rez",
      documentNumber: "123456789",
      email: "ana.perez@test.com",
      mobile: "3001234567",
    });
    await captureEvidence(page, testInfo, "mvp-08-cp004-local-datos-validos");

    await form.submit();

    const submission = form.lastGoogleFormSubmission();
    expect(submission).toBeTruthy();
    expect(submission.method).toBe("POST");
    expect(submission.url).toBe(googleFormEndpoint);

    const expectedGoogleValues = {
      "entry.80860134": "Ana",
      "entry.202371310": "P\u00e9rez",
      "entry.421600673": "CC",
      "entry.343354658": "123456789",
      "entry.1455277869": "ana.perez@test.com",
      "entry.1157769341": "57",
      "entry.1315389908": "3001234567",
      "entry.2050709377": "COL",
      "entry.2099415078": "BOG",
      "entry.338292013": "11001",
      "entry.1595196505": "Aspirante",
      "entry.13819069": "PREG",
      "entry.935513833": validLead.faculty,
      "entry.338019176": validLead.program,
      "entry.1914126671": validLead.period,
      "entry.1520118521": "source",
      "entry.1595817695": "subsource",
      "entry.581608949": "medium",
      "entry.1956432705": "campaign",
      "entry.1760775936": "11/05/2026, 09:00 a.\u00A0m.",
      "entry.2113694561": "Evento CP-004",
    };

    expect(submission.values).toMatchObject(expectedGoogleValues);
    expect(Object.keys(submission.values).sort()).toEqual(
      Object.keys(expectedGoogleValues).sort(),
    );

    await writePayloadEvidence("cp004-google-form-payload.json", {
      endpoint: submission.url,
      method: submission.method,
      values: submission.values,
      note: "data_authorization exists in the internal payload but has no entry.* mapping configured in MOCK/schema.js.",
    });

    const internalPayload = page.locator("pre", { hasText: '"formId"' });
    await expect(internalPayload).toContainText('"data_authorization": true');
    await expect(internalPayload).toContainText(
      '"fevento": "11/05/2026, 09:00 a.\u00A0m."',
    );
    await captureEvidence(page, testInfo, "mvp-09-cp004-local-payload-interceptado");
  });
});

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "..", relativePath), "utf8"));
}

async function writePayloadEvidence(fileName, payload) {
  const evidenceDirectory = path.resolve(__dirname, "..", "..", "docs", "testing", "evidence");

  await fs.promises.mkdir(evidenceDirectory, { recursive: true });
  await fs.promises.writeFile(
    path.join(evidenceDirectory, fileName),
    `${JSON.stringify(payload, null, 2)}\n`,
    "utf8",
  );
}
