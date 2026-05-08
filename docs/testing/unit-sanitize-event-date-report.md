# Reporte unitario - Sanitizacion de fecha de evento

## Objetivo

Validar que la funcion critica de sanitizacion de `fevento` entregue una fecha compatible con el sistema receptor en formato `DD/MM/AAAA, HH:MM a.m/p.m.` o maneje entradas invalidas de forma controlada.

## Alcance

- Funcion principal evaluada: `sanitizeEventDate`.
- Funcion complementaria evaluada: `resolveEventDateValue`.
- Requerimiento asociado: RF-07.
- Tipo de prueba: unitaria.
- Runner: `node:test`.

## Matriz de resultados

| ID | Funcion | Datos de entrada | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|
| UT-FECHA-01 | `sanitizeEventDate` | `"2026-12-01, 9:50 pm"` | `"01/12/2026, 09:50 p. m."` | `"01/12/2026, 09:50 p. m."` | Aprobado |
| UT-FECHA-02 | `sanitizeEventDate` | `"05/06/2026, 12:00 a. m."` | `"05/06/2026, 12:00 a. m."` | `"05/06/2026, 12:00 a. m."` | Aprobado |
| UT-FECHA-03 | `sanitizeEventDate` | `"2026-6-5 9pm"` | `"05/06/2026, 09:00 p. m."` | `"05/06/2026, 09:00 p. m."` | Aprobado |
| UT-FECHA-04 | `sanitizeEventDate` | `"5-6-2026   7:05   AM"` | `"05/06/2026, 07:05 a. m."` | `"05/06/2026, 07:05 a. m."` | Aprobado |
| UT-FECHA-05 | `sanitizeEventDate` | `""` | `""` | `""` | Aprobado |
| UT-FECHA-06 | `sanitizeEventDate` | `"sin fecha"` | `""` | `""` | Aprobado |
| UT-FECHA-07 | `sanitizeEventDate` | `"2026-02-31, 9pm"` | `""` | `""` | Aprobado |
| UT-FECHA-08 | `sanitizeEventDate` | `null` | `""` | `""` | Aprobado |
| UT-FECHA-09 | `resolveEventDateValue` | `configDate = "05/06/2026, 12pm"`, `locationSearch = "?fevento=2026-12-01%2C%209pm"` | `"01/12/2026, 09:00 p. m."` | `"01/12/2026, 09:00 p. m."` | Aprobado |

## Resumen de ejecucion

| Indicador | Valor |
|---|---:|
| Suites ejecutadas | 2 |
| Pruebas/asserts ejecutados | 4 |
| Casos de datos documentados | 9 |
| Pruebas aprobadas | 4 |
| Pruebas fallidas | 0 |

## Observaciones para analisis posterior

- La funcion normaliza fechas ISO (`AAAA-MM-DD`) y fechas locales (`DD/MM/AAAA` o `DD-MM-AAAA`).
- Cuando la hora llega sin minutos, se completa con `:00`.
- Cuando la fecha es invalida, vacia o no parseable, el resultado controlado es cadena vacia.
- `resolveEventDateValue` prioriza el parametro `fevento` de la URL sobre el valor de configuracion.
- En la salida real del codigo se usa espacio no separable entre `a.`/`p.` y `m.`; en este reporte se presenta visualmente como `a. m.` o `p. m.` para facilitar lectura de negocio.
