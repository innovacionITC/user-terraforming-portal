# Sustitución del origen local por Dynamics 365

Este portal **no consulta Microsoft Dynamics 365 ni Dataverse**. No hay nombres lógicos de tablas, campos ni relaciones confirmados, y este documento no los inventa.

La interfaz ya depende de contratos estables. Cambiar el origen no exige reconstruir las pantallas.

## Flujo actual

```text
Pantallas React
    -> fetch a /api/cliente/*
        -> src/services/crm.ts
            -> LocalCrmAdapter
                -> src/data/fixtures/crm.ts
```

`src/services/crm.ts` es el único lugar que elige el origen. Las rutas leen `crm` y nunca reciben un `clienteId` desde el navegador para decidir qué información devolver.

## Contrato que debe conservar el adaptador real

La interfaz `CrmDataSource` está en `src/services/contracts.ts`.

| Método | Responsabilidad |
| --- | --- |
| `authenticate` | Validar las credenciales del canal que se adopte y devolver el perfil público, sin secretos. |
| `getCliente` | Resolver el contacto asociado a la sesión. |
| `getResumen` | Totales calculados solo con las compras de ese cliente. |
| `getCompras` / `getCompra` | Listado y detalle de negociaciones propias. |
| `getPedidos` | Misma negociación, proyectada para el selector del estado de cuenta. No debe duplicar la compra. |
| `getEstadoCuenta` | Separación, cuota inicial, plan y cuotas de una sola compra. |
| `getNotificaciones` | Avisos derivados de los registros de ese cliente. |

Si el identificador no pertenece al cliente de la sesión, el método devuelve `null`. La ruta responde 404 con un mensaje genérico.

## Reglas que el adaptador real debe respetar

La evaluación económica vive en `src/domain/finanzas.ts`. Un adaptador de Dataverse debería traducir las filas confirmadas al tipo `CompraRegistro` y dejar que ese módulo calcule estados, saldos y resumen. Así se conserva el comportamiento ya probado:

- Una negociación es una compra, aunque en el CRM existan cotización y pedido relacionados.
- Separación, cuota inicial y cuotas son obligaciones distintas.
- El plan de cuotas solo se incluye cuando la modalidad es financiada y los hitos existen.
- Una compra de contado no genera cuotas de financiación.
- Un abono parcial conserva valor pagado y saldo. El saldo no baja de cero.
- Una fecha programada no equivale a un pago aplicado.
- Las cuotas del indicador "cuotas pagadas" son solo hitos generados y pagados por completo.

Hasta tener el diccionario de datos real, los campos de `CompraRegistro` son el contrato de la aplicación, no un mapa de Dataverse.

## Autenticación

La cookie actual solo demuestra el recorrido dentro de esta aplicación. Para un entorno real conviene sustituirla por un proveedor compatible con el entorno de Microsoft, por ejemplo Microsoft Entra External ID.

El reemplazo debe:

1. Autenticar a la persona fuera de esta base de código.
2. Resolver en el servidor el contacto del CRM asociado a esa identidad.
3. Guardar ese identificador en una sesión de servidor. El navegador no debe elegir el `clienteId`.
4. Mantener el rol Cliente separado de los permisos del portal de vendedores.
5. Dejar las credenciales de Dataverse en variables de entorno del servidor, nunca en el frontend.

Las rutas bajo `/api/cliente/*` pueden permanecer. Solo cambia cómo `clienteDeLaSesion()` obtiene al cliente y qué clase implementa `CrmDataSource`.

## Qué no hacer en la integración

- No llamar a Dataverse desde componentes de React.
- No reenviar al navegador tokens de aplicación ni secretos de cliente.
- No aceptar un identificador de compra sin comprobar la propiedad en el servidor.
- No presentar nombres lógicos supuestos como si ya estuvieran confirmados.
- No duplicar en el resumen una cotización y el pedido de la misma negociación.
- No inventar cuotas cuando el plan todavía no existe en el CRM.

## Paso de corte

1. Implementar `CrmDataSource` en un archivo nuevo, por ejemplo `src/services/adapters/dataverse-adapter.ts`.
2. Mapear allí únicamente columnas verificadas en el ambiente de Dynamics.
3. Documentar en ese momento tabla, nombre lógico, relación con el contacto y transformación.
4. Reemplazar la exportación de `src/services/crm.ts`.
5. Eliminar o dejar de importar `src/data/fixtures/crm.ts` en el entorno real.
6. Ejecutar `npm test` sobre `src/domain/finanzas.test.ts` y añadir pruebas del adaptador con respuestas fijadas del CRM, sin credenciales.
