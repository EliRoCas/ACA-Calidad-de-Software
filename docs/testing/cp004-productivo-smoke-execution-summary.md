# CP-004 - Resumen de ejecucion productiva/smoke

| Campo | Resultado |
|---|---|
| Fecha de ejecucion | 2026-05-08T18:53:53.143Z |
| Modo | Productivo/smoke |
| Estado | Aprobado |
| Endpoint | https://docs.google.com/forms/u/0/d/e/1FAIpQLSfw40ns2QRcxUkOCcr_TLcW1asygUr9yENC5wKubVRAxWZHSg/formResponse |
| Metodo HTTP | POST |
| Nombre | QA Test |
| Apellido | Automatizado |
| Correo | qa.test.1778266431202@example.com |
| Resultado esperado | El formulario carga, permite completar datos validos y ejecuta el envio sin error critico. |
| Resultado obtenido | Se capturo el POST hacia Google Forms y el formulario mostro confirmacion funcional de envio. |

## Valores enviados observados

| Codigo entry | Valor |
|---|---|
| `entry.80860134` | QA Test |
| `entry.202371310` | Automatizado |
| `entry.421600673` | CC |
| `entry.343354658` | 1020304050 |
| `entry.1455277869` | qa.test.1778266431202@example.com |
| `entry.1157769341` | 57 |
| `entry.1315389908` | 3001234567 |
| `entry.2050709377` | COL |
| `entry.2099415078` | BOG |
| `entry.338292013` | 11001 |
| `entry.1595196505` | Aspirante |
| `entry.13819069` | PREG |
| `entry.935513833` | Ingeniería |
| `entry.338019176` | ISIST |
| `entry.1914126671` | PREG2630 |
| `entry.1520118521` | marketing_mvp |
| `entry.1595817695` |  |
| `entry.581608949` |  |
| `entry.1956432705` |  |
| `entry.1760775936` |  |
| `entry.2113694561` | Marketing MVP |

## Evidencias

- Datos validos antes del envio: `docs/testing/evidence/mvp-10-cp004-productivo-datos-validos.png`
- Confirmacion posterior al envio: `docs/testing/evidence/mvp-11-cp004-productivo-confirmacion.png`

## Nota

Este resumen corresponde al modo productivo/smoke de CP-004. La validacion profunda de mapeo `entry.*` se conserva en el modo local/controlado para evitar registros reales innecesarios.
