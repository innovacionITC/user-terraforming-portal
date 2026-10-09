# Portal de clientes · Terra Gestión Inmobiliaria

Portal web para que las personas que compran lotes consulten sus compras y su estado de cuenta. La aplicación está construida con Next.js, React, TypeScript y Tailwind CSS.

**Esta versión no se conecta con Microsoft Dynamics 365 ni con Dataverse.** La información comercial vive en registros locales y se entrega a través de rutas internas. La interfaz la presenta como el contenido habitual del portal. La naturaleza local de esos registros está documentada en el código y en este archivo, no en las pantallas.

La sesión usa una cookie `HttpOnly` firmada en el servidor. Ese mecanismo sirve para recorrer la aplicación en local. **No es autenticación de producción** ni un control suficiente para datos financieros reales.

## Requisitos

- Node.js 22
- npm 10

## Instalación y ejecución

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Comandos de verificación:

```bash
npm test
npm run typecheck
npm run lint
npm run build
npm start
```

## Variables de entorno

Copia `.env.example` si quieres fijarlas. Si no existen, en desarrollo se usa una clave local conocida, documentada abajo. En `NODE_ENV=production` la aplicación exige `SESSION_SECRET`.

| Variable | Uso |
| --- | --- |
| `SESSION_SECRET` | Firma la cookie de sesión. Mínimo 16 caracteres. No es una credencial de Dynamics. |
| `SIMULATED_LATENCY_MS` | Espera artificial de las rutas internas, en milisegundos. `0` la desactiva. |

Valor local de referencia:

```text
SESSION_SECRET=desarrollo-local-terra-portal-no-usar-en-produccion
```

## Cuentas locales

Estas credenciales solo aparecen aquí. No se muestran en la pantalla de acceso.

| Cliente | Correo | Contraseña | Qué permite recorrer |
| --- | --- | --- | --- |
| Juan Carlos Pérez | `juan.perez@correo.com` | `Valle12.terra` | Una compra financiada, plan de 24 cuotas, cuotas pagadas, una parcial y cuotas vencidas o pendientes. |
| Laura Gómez Arango | `laura.gomez@correo.com` | `Sendero05.terra` | Una compra de contado, con separación pagada y cuota inicial parcial. Sin cuotas de financiación. |
| Camila Herrera Duque | `camila.herrera@correo.com` | `Altos08.terra` | Tres compras: una financiada con hitos, una financiada sin hitos y una de contado finalizada. |
| Andrés Felipe Molina | `andres.molina@correo.com` | `Reserva.terra` | Perfil sin compras. |

## Rutas

```text
/login
/inicio
/mis-lotes
/mis-lotes/[id]
/mis-pagos
/mis-pagos/[id]
```

`Mis pagos` abre el estado de cuenta. No hay un segundo módulo financiero.

En el detalle de cada pago aparecen dos acciones de interfaz que todavía no tienen canal externo:

- **Pagar con PSE** abre el valor pendiente. No debita dinero ni cambia el saldo.
- **Ver recibo** muestra el comprobante de un pago ya registrado.
- El botón flotante **Soporte** abre el chat. Los mensajes no se envían a un asesor.

## Cómo está organizado

```text
src/app/            páginas y rutas internas
src/components/     interfaz
src/domain/         reglas financieras puras
src/services/       contrato CrmDataSource y adaptador local
src/data/fixtures/  registros locales, solo en servidor
src/lib/            sesión, formato y cliente HTTP
```

Las pantallas consultan `/api/cliente/*`. No importan los registros locales. El servidor identifica al cliente con la cookie y rechaza compras que no le pertenecen, aunque se cambie el identificador en la URL.

## Reglas financieras

- Cada compra es una sola negociación. No se duplica por existir una cotización y un pedido del mismo proceso.
- Los pagos realizados suman abonos reconocidos de separación, cuota inicial y cuotas generadas. Un abono no puede dejar el saldo en negativo.
- El saldo pendiente de una compra es el valor total menos esos abonos.
- Una fecha prevista no marca un pago como realizado.
- Si hay un abono menor que el valor, el estado es parcial.
- Sin abono y con fecha ya vencida, el estado es vencida.
- Las cuotas del plan solo aparecen cuando la modalidad es financiada y los hitos ya fueron generados.
- Las compras de contado no muestran cuotas de financiación.
- Las cuotas pagadas del resumen cuentan solo cuotas generadas y pagadas por completo.

Los cálculos están en `src/domain/finanzas.ts` y se cubren con `npm test`.

## Sustituir el origen local

El punto de cambio es `src/services/crm.ts`. El procedimiento está en [docs/sustitucion-dynamics.md](docs/sustitucion-dynamics.md).

## Despliegue

No hace falta una base de datos para esta versión.

```bash
npm run build
npm start
```

Antes de publicar un entorno real hay que definir `SESSION_SECRET`, retirar las cuentas locales y reemplazar la sesión y el adaptador por autenticación e integración reales. Hasta entonces el portal no debe exponerse con información financiera de clientes.
