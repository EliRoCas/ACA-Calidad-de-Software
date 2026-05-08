const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const { sanitizeEventDate, resolveEventDateValue } = require("../../base/utils.js");

describe("sanitizeEventDate", () => {
  it("normaliza fechas validas al formato DD/MM/AAAA, HH:MM a.m/p.m.", () => {
    assert.equal(
      sanitizeEventDate("2026-12-01, 9:50 pm"),
      "01/12/2026, 09:50 p.\u00A0m.",
    );
    assert.equal(
      sanitizeEventDate("05/06/2026, 12:00 a. m."),
      "05/06/2026, 12:00 a.\u00A0m.",
    );
  });

  it("acepta entradas irregulares y completa minutos cuando solo llega la hora", () => {
    assert.equal(
      sanitizeEventDate("2026-6-5 9pm"),
      "05/06/2026, 09:00 p.\u00A0m.",
    );
    assert.equal(
      sanitizeEventDate("5-6-2026   7:05   AM"),
      "05/06/2026, 07:05 a.\u00A0m.",
    );
  });

  it("retorna cadena vacia ante entradas invalidas o vacias", () => {
    assert.equal(sanitizeEventDate(""), "");
    assert.equal(sanitizeEventDate("sin fecha"), "");
    assert.equal(sanitizeEventDate("2026-02-31, 9pm"), "");
    assert.equal(sanitizeEventDate(null), "");
  });
});

describe("resolveEventDateValue", () => {
  it("prioriza fevento de la URL y aplica sanitizacion", () => {
    assert.equal(
      resolveEventDateValue("05/06/2026, 12pm", "?fevento=2026-12-01%2C%209pm"),
      "01/12/2026, 09:00 p.\u00A0m.",
    );
  });
});
