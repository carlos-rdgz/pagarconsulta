const stripe = require('stripe')('sk_test_YOUR_STRIPE_SECRET_KEY'); // ⚠️ REEMPLAZA CON TU CLAVE SECRETA REAL

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const { formData } = JSON.parse(event.body);

  try {
    // Crear sesión de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Pago de Consulta',
            description: 'Servicio de consulta profesional - $99.99',
          },
          unit_amount: 9999, // $99.99 en centavos
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `https://pagosconsultas.netlify.app/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://pagosconsultas.netlify.app/index.html`,
      metadata: {
        nombre: formData.nombre,
        apellido: formData.apellido,
        correo: formData.correo,
        telefono: formData.telefono,
        seguro_social: formData.seguro_social,
        fecha_cumpleanos: formData.fecha_cumpleanos,
        direccion: formData.direccion,
        ciudad: formData.ciudad,
        cp: formData.cp
      },
      customer_email: formData.correo,
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        sessionId: session.id,
        url: session.url
      })
    };

  } catch (error) {
    console.error('Error creando sesión de Stripe:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
