# Cubaclick — Web SPA v2 (con mejoras)

## Novedades
- **Checkout** deja claro que los datos son *de tu familiar* (obligatorio nombre y apellidos, teléfono, dirección; nota opcional).
- **PIN de administración**: `Cubaclick2020@*`.
- **Portada editable** desde Admin: título, subtítulo e imagen (URL).
- **Sonido** en todos los botones (click sutil).
- **Dashboard de ventas** por vendedor: órdenes, unidades de productos, combos, remesas (USD) y total de ventas.
- **WhatsApp diario de bajo stock**: botón en Admin que abre WA con la lista de productos con stock ≤5 (configura el teléfono del administrador).
- **Descuento de stock por combos**: al registrar un pedido, se resta el stock del combo y de cada producto mapeado en *Deducciones*.
  - Configura las *Deducciones* de cada combo en Admin → botón **Deducciones**: elige productos y cantidades que se descuentan por cada 1 combo.

## Uso
1. Abre `index.html` (o súbelo a tu hosting).
2. Ve a **Admin** (abajo a la derecha). PIN: `Cubaclick2020@*`.
3. Ajusta **teléfonos** de vendedores y el **WhatsApp del administrador** (para reportes).
4. Carga/edita **productos** y **combos**. En cada combo, entra a **Deducciones** para mapear los productos del combo.
5. En **Remesas**, puedes **Registrar remesa** para que aparezca en el dashboard por vendedor.
6. Para enviar el reporte de bajo stock, pulsa **Enviar bajo stock por WhatsApp**.

> Nota: Los datos se guardan en `localStorage`, por lo que no requiere servidor.
