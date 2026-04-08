const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    // PayPal IPN data
    const ipnData = event.body;
    console.log('IPN received:', ipnData);

    // Parse IPN data (URL encoded)
    const params = new URLSearchParams(ipnData);
    const paymentStatus = params.get('payment_status');
    const txnId = params.get('txn_id');
    const customData = params.get('custom');
    const amount = params.get('mc_gross');

    if (paymentStatus === 'Completed') {
      // Parse custom data (form data)
      let formData = {};
      if (customData) {
        try {
          formData = JSON.parse(customData);
        } catch (e) {
          console.error('Error parsing custom data in IPN:', e);
        }
      }

      // Save transaction to file
      const txFile = path.join(__dirname, '../../transactions.json');
      let transactions = [];
      try {
        const data = await fs.readFile(txFile, 'utf8');
        transactions = JSON.parse(data);
      } catch (e) {
        // File doesn't exist, create new
      }

      transactions.push({
        txnId,
        status: paymentStatus,
        formData,
        amount,
        timestamp: new Date().toISOString(),
        source: 'IPN'
      });

      await fs.writeFile(txFile, JSON.stringify(transactions, null, 2));
      console.log('Transaction saved via IPN:', txnId);
    }

    // Always respond with 200 to acknowledge receipt
    return {
      statusCode: 200,
      body: 'OK'
    };

  } catch (error) {
    console.error('IPN processing error:', error);
    return {
      statusCode: 500,
      body: 'Error processing IPN'
    };
  }
};