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

## Caso adicional: Smoke productivo contra Google

- Objetivo: validar que un envio valido complete el flujo contra el endpoint publicado.
- Tipo: smoke E2E productivo con Playwright.
- Alcance: submit real del MVP cuando el ambiente lo habilita explicitamente.
- Requerimientos: RF-11.
- Condicion de ejecucion: requiere `TEST_ENV=prod` y `MVP_PROD_SMOKE_ENABLED=true`; si `MVP_PROD_URL` no existe, Playwright levanta el MVP local y ejecuta el POST real al endpoint Google configurado.
- Datos de entrada: lead academico seguro con correo `example.com` y timestamp.
- Resultado esperado: el formulario muestra confirmacion de envio o mensaje equivalente de exito.

## Scripts

- `npm run test:unit`: ejecuta la prueba unitaria de `fevento`.
- `npm run test:e2e:mvp`: ejecuta la suite Playwright local del MVP.
- `npm run test:e2e:prod`: ejecuta solo el smoke productivo protegido.
- `npm run test:all`: ejecuta unitarias y E2E local.

## Evidencias visuales

Las pruebas E2E generan capturas PNG en `docs/testing/evidence/` y las adjuntan tambien al reporte HTML de Playwright. Las imagenes actuales cubren render inicial sin errores, validaciones obligatorias, bloqueo de datos invalidos, flujo academico desde JSON, payload final, datos validos para smoke Google y confirmacion del envio productivo.
