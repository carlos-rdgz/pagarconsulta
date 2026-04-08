const stripe = require('stripe')('sk_test_YOUR_STRIPE_SECRET_KEY'); // ⚠️ MISMA CLAVE QUE EN create-checkout-session.js
const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const sig = event.headers['stripe-signature'];
  const endpointSecret = 'whsec_YOUR_WEBHOOK_SECRET'; // ⚠️ OBTÉN ESTO DEL DASHBOARD DE STRIPE

  let stripeEvent;

  try {
    // Verificar la firma del webhook
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return { statusCode: 400, body: 'Webhook signature verification failed' };
  }

  // Manejar el evento
  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;

    // Extraer metadata del cliente
    const formData = {
      nombre: session.metadata.nombre,
      apellido: session.metadata.apellido,
      correo: session.metadata.correo,
      telefono: session.metadata.telefono,
      seguro_social: session.metadata.seguro_social,
      fecha_cumpleanos: session.metadata.fecha_cumpleanos,
      direccion: session.metadata.direccion,
      ciudad: session.metadata.ciudad,
      cp: session.metadata.cp
    };

    // Guardar transacción
    const txFile = path.join(__dirname, '../../transactions.json');
    let transactions = [];
    try {
      const data = await fs.readFile(txFile, 'utf8');
      transactions = JSON.parse(data);
    } catch (e) {
      // Archivo no existe, crear nuevo
    }

    transactions.push({
      sessionId: session.id,
      paymentIntentId: session.payment_intent,
      status: 'completed',
      formData,
      amount: session.amount_total / 100, // Convertir de centavos
      currency: session.currency,
      timestamp: new Date().toISOString(),
      source: 'Stripe Webhook'
    });

    await fs.writeFile(txFile, JSON.stringify(transactions, null, 2));
    console.log('Transacción guardada vía webhook de Stripe:', session.id);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true })
  };
};