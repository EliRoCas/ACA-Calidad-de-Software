# Casos de prueba - Formulario Marketing MVP

## Base reutilizada desde formularios-1

Se tomaron como referencia los patrones de `formularios-1` para separar datos de prueba, Page Object, specs locales y smoke productivo protegido por entorno. Se adaptaron las ideas de fixtures de validacion, flujo academico por JSON y proteccion de pruebas productivas, pero no se migraron matrices extensas, reporters Markdown complejos, reglas Salesforce, popup de asistencia, autoselecciones avanzadas ni casos de negocio no implementados por el MVP.

## Caso 1: Sanitizacion de fecha de evento

- Objetivo: validar que `fevento` siempre salga en formato `DD/MM/AAAA, HH:MM a.m/p.m.` antes de construir el payload.
- Tipo: prueba unitaria con `node:test`.
- Alcance: entradas validas, formatos irregulares, entradas vacias o invalidas.
- Requerimientos: RF-07.
- Escenario: invocar `sanitizeEventDate` y `resolveEventDateValue` con fechas ISO, fechas locales, hora corta y valores invalidos.
- Datos de entrada: `2026-12-01, 9:50 pm`, `2026-6-5 9pm`, `5-6-2026 7:05 AM`, cadena vacia, texto sin fecha y fecha calendario invalida.
- Resultado esperado: la funcion retorna una fecha normalizada o cadena vacia de forma controlada.

## Caso 2: Bloqueo de envio invalido

- Objetivo: validar que el formulario no permita submit con campos obligatorios vacios o datos invalidos.
- Tipo: prueba funcional E2E con Playwright.
- Alcance: obligatorios, nombre, apellido, documento, celular, correo, autorizacion y bloqueo de submit.
- Requerimientos: RF-01, RF-02, RF-03, RF-04, RF-05, RF-06, RF-10.
- Escenario: abrir el formulario, verificar que no hay errores iniciales, confirmar que el boton esta deshabilitado sin autorizacion, autorizar, intentar enviar vacio, ingresar datos invalidos y volver a enviar.
- Datos de entrada: nombres con numeros, documento alfabetico para CC, celular con letras/simbolos, correo `dev@@gmail.com`.
- Resultado esperado: los errores aparecen solo tras intento de submit, los campos sanitizables eliminan caracteres no permitidos, el correo queda invalido y no se genera payload de envio.

## Caso 3: Flujo academico y campos ocultos

- Objetivo: validar que las opciones academicas visibles salen del JSON y que los campos ocultos se conservan para el envio.
- Tipo: integracion funcional con Playwright.
- Alcance: carga dinamica de niveles, facultades, programas, periodos, tracking y hidden fields.
- Requerimientos: RF-08, RF-09.
- Escenario: cargar el formulario con parametros UTM y `fevento`, leer los JSON locales, comparar opciones visibles, completar un flujo academico y enviar con datos validos.
- Datos de entrada: nivel `PREG`, facultad `Ingenieria` segun el valor acentuado del JSON, programa `ISIST`, periodo `PREG2630`, `fevento=2026-12-01, 9pm`.
- Resultado esperado: los selectores contienen los valores configurados, existen `utm_source`, `utm_subsource`, `utm_campaign`, `utm_medium`, `fevento` y `nevento`, y el payload final conserva valores visibles, ocultos y tracking.

## CP-004: Validacion de integracion con Google Forms y smoke productivo

- Objetivo: validar que el MVP construya, mapee y envie correctamente los datos hacia Google Forms mediante codigos `entry.*`, incluyendo campos visibles, campos ocultos, autorizacion, UTMs y fecha de evento sanitizada. Ademas, validar mediante smoke productivo que el formulario publicado mantenga operativo su flujo minimo critico.
- Tipo: integracion funcional + smoke productivo.
- Alcance: carga del formulario, diligenciamiento de obligatorios, aceptacion de autorizacion, mapeo hacia `entry.*`, campos ocultos, UTMs, fecha sanitizada, envio hacia Google Forms y validacion smoke en produccion.
- Fuera de alcance: regresion exhaustiva, carga, seguridad avanzada, validacion legal del texto de autorizacion y validacion manual profunda del almacenamiento interno de Google Forms.
- Modo local/controlado: intercepta `**/formResponse`, captura `request.postData()`, valida payload y no genera registros reales.
- Modo productivo/smoke: ejecuta la URL publicada o configurada, completa un flujo minimo con datos de prueba identificables y valida que el envio no falle con error critico.
- Datos modo local/controlado: nombre `Ana`, apellido `Perez`, documento `123456789`, correo `ana.perez@test.com`, celular `3001234567`, fecha evento `11/05/2026, 9am`, UTMs `source/subsource/medium/campaign`.
- Datos modo productivo/smoke: nombre `QA Test`, apellido `Automatizado`, correo `qa.test.{timestamp}@example.com`.
- Resultado esperado: el modo local valida todos los `entry.*` configurados y la fecha sanitizada sin crear registros reales; el modo productivo confirma que el formulario publicado carga, permite completar datos validos y ejecuta el envio sin error critico.
- Evidencias: `docs/testing/evidence/mvp-08-cp004-local-datos-validos.png`, `docs/testing/evidence/mvp-09-cp004-local-payload-interceptado.png`, `docs/testing/evidence/cp004-google-form-payload.json`, `docs/testing/evidence/mvp-10-cp004-productivo-datos-validos.png` y `docs/testing/evidence/mvp-11-cp004-productivo-confirmacion.png`.


## Matriz final de casos

| ID | Tipo | Nombre |
|---|---|---|
| CP-001 | Prueba unitaria | Sanitizacion de fecha de evento |
| CP-002 | E2E funcional | Validacion de campos obligatorios, formatos y autorizacion |
| CP-003 | Integracion funcional / E2E | Flujo academico dinamico desde JSON/configuracion |
| CP-004 | Integracion funcional + smoke productivo | Envio hacia Google Forms y verificacion minima en produccion |

## Scripts

- `npm run test:unit`: ejecuta la prueba unitaria de `fevento`.
- `npm run test:e2e:mvp`: ejecuta la suite Playwright local del MVP.
- `npm run test:e2e:prod`: ejecuta CP-004 en modo productivo/smoke protegido. Requiere habilitación explícita 
`$env:MVP_PROD_SMOKE_ENABLED='true'; npm run test:e2e:prod`

- `npm run test:all`: ejecuta unitarias y E2E local.

## Evidencias visuales

Las pruebas E2E generan capturas PNG en `docs/testing/evidence/` y las adjuntan tambien al reporte HTML de Playwright. Las imagenes actuales cubren render inicial sin errores, validaciones obligatorias, bloqueo de datos invalidos, flujo academico desde JSON, payload final, CP-004 local/controlado y CP-004 productivo/smoke.
