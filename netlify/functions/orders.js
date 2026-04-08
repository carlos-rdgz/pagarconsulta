const paypal = require('@paypal/checkout-server-sdk');

// Configuración PayPal - REEMPLAZA CON TUS CREDENCIALES
const environment = new paypal.core.SandboxEnvironment(
  'AZyElkuGTtZOQKbi8ZFTWu7Zl4gbfaWGvBYqPaH4aDX32QFJtlxhc4dfMvle4CSy0zTYH3lsSq2UxtEI', // Tu Client ID sandbox
  'EEvN2L8NGM8sQdM7LmghQGL5-dv_0Fya7NufiLoU2ktn2jATiOXihyIXT9DIOi9wbDpXpKgFSl4yNQJo'     // Tu Secret sandbox
);
// Para LIVE: new paypal.core.LiveEnvironment(clientId, secret)

const client = new paypal.core.PayPalHttpClient(environment);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const { action, orderID, formData } = JSON.parse(event.body);

  try {
    if (action === 'create') {
      // Crear orden PayPal
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: '99.99' // Monto consulta abogado
          },
          description: 'Pago de Consulta',
          custom_id: formData.nombre + '_' + Date.now() // ID único
        }]
      });

      const order = await client.execute(request);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderID: order.result.id })
      };
    } else if (action === 'capture') {
      // Capturar pago
      const request = new paypal.orders.OrdersCaptureRequest(orderID);
      request.requestBody({});

      const capture = await client.execute(request);

      // Guardar transacción
      const fs = require('fs').promises;
      const path = require('path');
      const txFile = path.join(__dirname, '../../transactions.json');
      
      let transactions = [];
      try {
        const data = await fs.readFile(txFile, 'utf8');
        transactions = JSON.parse(data);
      } catch (e) {
        // Archivo no existe, crear nuevo
      }
      
      transactions.push({
        orderID,
        status: capture.result.status,
        formData,
        timestamp: new Date().toISOString(),
        amount: '99.99 USD'
      });
      
      await fs.writeFile(txFile, JSON.stringify(transactions, null, 2));

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, orderID, status: capture.result.status })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
