# Reporte de integracion funcional - Flujo academico y campos ocultos

## Objetivo

Validar que el Formulario Marketing MVP cargue opciones academicas desde los JSON de configuracion, permita completar el flujo dinamico y conserve los campos ocultos necesarios para el envio.

## Alcance

- Tipo de prueba: integracion funcional con Playwright.
- Archivo de prueba: `tests/e2e/marketing-mvp.spec.js`.
- Caso automatizado: `carga flujo academico desde JSON y conserva campos ocultos`.
- Requerimientos asociados: RF-08, RF-09, RF-07.

## Matriz de resultados

| ID | Funcion/flujo evaluado | Datos de entrada | Resultado esperado | Resultado obtenido | Evidencia | Estado |
|---|---|---|---|---|---|---|
| INT-ACA-01 | Carga de niveles academicos desde JSON | `MOCK/JSON/programas.json` | El selector `nivelacademico` debe contener las llaves configuradas en el JSON | El selector contiene los niveles esperados, incluyendo `PREG` | `docs/testing/evidence/mvp-04-flujo-academico-json.png` | Aprobado |
| INT-ACA-02 | Carga de facultades dependientes | `nivelacademico = "PREG"` | El selector `facultad` debe contener las facultades configuradas para `PREG` | El selector contiene las facultades del JSON para `PREG` | `docs/testing/evidence/mvp-04-flujo-academico-json.png` | Aprobado |
| INT-ACA-03 | Carga de programas dependientes | `nivelacademico = "PREG"`, `facultad = "Ingenieria"` segun valor acentuado del JSON | El selector `programa_principal` debe contener los codigos de programas de la facultad seleccionada | El selector contiene los programas configurados y permite seleccionar `ISIST` | `docs/testing/evidence/mvp-04-flujo-academico-json.png` | Aprobado |
| INT-ACA-04 | Carga de periodos dependientes | `nivelacademico = "PREG"` | El selector `periodo_esperado` debe contener los valores definidos en `MOCK/JSON/periodos.json` | El selector contiene los periodos para `PREG` y permite seleccionar `PREG2630` | `docs/testing/evidence/mvp-04-flujo-academico-json.png` | Aprobado |
| INT-ACA-05 | Existencia de campos ocultos | Campos esperados: `utm_source`, `utm_subsource`, `utm_campaign`, `utm_medium`, `fevento`, `nevento` | Cada campo debe existir como `input[type="hidden"]` | Todos los campos ocultos esperados existen en el DOM | `docs/testing/evidence/mvp-05-payload-final-y-campos-ocultos.png` | Aprobado |
| INT-ACA-06 | Valores ocultos base | URL con `fevento=2026-12-01, 9pm` y valores por defecto del schema | `utm_source = "marketing_mvp"`, `nevento = "Marketing MVP"`, `fevento = "01/12/2026, 09:00 p. m."` | Los campos ocultos conservan los valores esperados y `fevento` queda sanitizado | `docs/testing/evidence/mvp-05-payload-final-y-campos-ocultos.png` | Aprobado |
| INT-ACA-07 | Payload final del flujo academico | Datos validos completos del lead academico | El payload debe incluir programa, periodo y fecha de evento sanitizada | El payload final contiene `programa_principal = "ISIST"`, `periodo_esperado = "PREG2630"` y `fevento = "01/12/2026, 09:00 p. m."` | `docs/testing/evidence/mvp-05-payload-final-y-campos-ocultos.png` | Aprobado |

## Resumen de ejecucion

| Indicador | Valor |
|---|---:|
| Tests automatizados ejecutados | 1 |
| Validaciones de integracion documentadas | 7 |
| Evidencias PNG generadas | 2 |
| Resultado general | Aprobado |

## Observaciones para analisis posterior

- La prueba contrasta los selectores visibles contra los JSON locales usados por el MVP.
- El flujo valida dependencias reales entre nivel academico, facultad, programa y periodo.
- Los campos ocultos se validan como elementos reales del DOM y luego como parte del payload final.
- Este caso no valida variaciones complejas por configuracion ni todas las facultades/programas posibles; se enfoca en un flujo representativo y mantenible para el MVP academico.
