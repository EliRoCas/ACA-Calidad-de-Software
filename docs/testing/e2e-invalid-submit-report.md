# Reporte E2E - Bloqueo de envio invalido

## Objetivo

Validar en navegador que el Formulario Marketing MVP no permita el envio cuando faltan datos obligatorios, cuando los datos ingresados son invalidos o cuando no existe autorizacion de tratamiento de datos.

## Alcance

- Tipo de prueba: funcional E2E con Playwright.
- Archivo de prueba: `tests/e2e/marketing-mvp.spec.js`.
- Caso automatizado: `bloquea envio invalido y muestra validaciones solo despues de interaccion`.
- Requerimientos asociados: RF-01, RF-02, RF-03, RF-04, RF-05, RF-06, RF-10.

## Matriz de resultados

| ID | Funcion/flujo evaluado | Datos de entrada | Resultado esperado | Resultado obtenido | Evidencia | Estado |
|---|---|---|---|---|---|---|
| E2E-VAL-01 | Render inicial del formulario | Apertura del formulario sin completar campos | No deben mostrarse errores visuales ni resumen de errores en el primer render | El formulario carga campos principales y no se encuentran errores visibles ni resumen de errores | `docs/testing/evidence/mvp-01-render-inicial-sin-errores.png` | Aprobado |
| E2E-VAL-02 | Bloqueo por autorizacion | Formulario sin marcar `data_authorization` | El boton `Enviar MVP` debe permanecer deshabilitado | El boton se valida como deshabilitado antes de aceptar autorizacion | `docs/testing/evidence/mvp-01-render-inicial-sin-errores.png` | Aprobado |
| E2E-VAL-03 | Validacion de obligatorios | Usuario autoriza tratamiento de datos e intenta enviar campos vacios | El formulario debe impedir el envio y mostrar errores para campos requeridos | El formulario muestra mensaje de revision y errores para nombre, apellido, tipo de documento, numero de documento, telefono y email | `docs/testing/evidence/mvp-02-validaciones-obligatorias.png` | Aprobado |
| E2E-VAL-04 | Sanitizacion de nombre y apellido | `first_name = "Laura123"`, `last_name = "Suarez456"` | Los campos no deben conservar numeros | Los valores quedan sanitizados como `Laura` y `Suarez` | `docs/testing/evidence/mvp-03-bloqueo-datos-invalidos.png` | Aprobado |
| E2E-VAL-05 | Validacion de documento segun tipo | `tipo_doc = "CC"`, `numero_doc = "ABC!*"` | Para CC no deben aceptarse letras ni simbolos; el valor no debe permitir envio valido | El campo queda vacio tras sanitizacion y el submit sigue bloqueado | `docs/testing/evidence/mvp-03-bloqueo-datos-invalidos.png` | Aprobado |
| E2E-VAL-06 | Validacion de celular | `mobile = "abc---"` | El celular no debe aceptar letras ni simbolos; el valor resultante no debe permitir envio | El campo queda vacio tras sanitizacion y el submit sigue bloqueado | `docs/testing/evidence/mvp-03-bloqueo-datos-invalidos.png` | Aprobado |
| E2E-VAL-07 | Validacion estricta de correo | `email = "dev@@gmail.com"` | El correo con doble arroba debe marcarse como invalido y bloquear el envio | El campo email queda con estado visual `is-invalid` y no se genera payload final de envio | `docs/testing/evidence/mvp-03-bloqueo-datos-invalidos.png` | Aprobado |

## Resumen de ejecucion

| Indicador | Valor |
|---|---:|
| Tests automatizados ejecutados | 1 |
| Validaciones funcionales documentadas | 7 |
| Evidencias PNG generadas | 3 |
| Resultado general | Aprobado |

## Observaciones para analisis posterior

- La prueba valida comportamiento real en navegador, no solo funciones aisladas.
- Los errores no aparecen antes de la interaccion inicial, lo cual evita una experiencia agresiva en el primer render.
- El boton de envio queda protegido por la autorizacion de tratamiento de datos.
- El caso cubre bloqueo del flujo invalido, pero no intenta probar todas las combinaciones posibles de documento, correo o celular; esas matrices podrian ampliarse si negocio requiere mayor profundidad.
