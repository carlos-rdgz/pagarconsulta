# TODO: Integración PayPal en Formulario de Pago

## Plan Aprobado - Pasos:

### 1. ✅ **Backup completado**
   - Creado `index_backup.html` con código original.

### 2. ✅ **Backend Netlify Functions creados**
   - `netlify/functions/package.json`
   - `netlify/functions/orders.js`

### 3. ✅ **Página éxito creada**
   - `success.html`

### 4. ✅ **index.html editado**
   - Remover campos tarjeta.
   - PayPal SDK agregado.
   - Lógica PayPal completa (validate → createOrder → buttons → capture → success).

### 5. ✅ **netlify.toml actualizado**
   - Config functions y npm build.

### 6. ✅ **transactions.json creado**

### 7. ✅ **Integración completa - Listo para deploy y test**
   - Reemplaza creds PayPal.
   - `netlify deploy --prod --dir=.` o drag to Netlify.
   - Local: `start index.html` (sandbox ok local, full test en Netlify HTTPS).

**¡Tarea completada!**

**Instrucciones:**
- Reemplaza `PAYPAL_CLIENT_ID` y `PAYPAL_SECRET` en `orders.js` con tus credenciales sandbox.
- Deploy a Netlify para HTTPS.
- Monto: $99.99 (consulta abogado).

**Progreso: Backup ✅. Próximo paso: Backend.**

