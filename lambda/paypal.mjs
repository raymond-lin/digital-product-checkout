import https from 'https';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const BASE_URL = process.env.BASE_URL;
const PAYPAL_API_HOST = process.env.PAYPAL_API_HOST;

let cachedToken = null;
let tokenExpiry = 0;

export const getPayPalToken = async () => {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) {
    return { access_token: cachedToken };
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
  const response = await makeHttpsRequest({
    hostname: PAYPAL_API_HOST,
    path: '/v1/oauth2/token',
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
  }, 'grant_type=client_credentials');

  cachedToken = response.access_token;
  tokenExpiry = now + (response.expires_in - 60) * 1000; // Subtract 60s buffer

  return { access_token: cachedToken };
};

export const createPayPalOrder = (accessToken, programName, sku, amount) => {
  return makeHttpsRequest({
    hostname: PAYPAL_API_HOST,
    path: '/v2/checkout/orders',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
  }, JSON.stringify({
    intent: 'CAPTURE',
    purchase_units: [{
      reference_id: programName,
      amount: {
        currency_code: 'USD',
        value: amount.toFixed(2),
        breakdown: {
          item_total: {
            currency_code: 'USD',
            value: amount.toFixed(2)
          }
        }
      },
      items: [{
        name: programName,
        sku: sku,
        quantity: "1",
        unit_amount: {
          currency_code: "USD",
          value: amount.toFixed(2)
        },
        category: "DIGITAL_GOODS"
      }]
    }],
    application_context: {
      brand_name: "My Site",
      shipping_preference: "NO_SHIPPING",
      user_action: "PAY_NOW",
      return_url: `${BASE_URL}order-confirmation.html?program=${encodeURIComponent(programName)}`,
      cancel_url: `${BASE_URL}order-cancelled.html?program=${encodeURIComponent(programName)}`
    }
  }));
};

export const capturePayPalOrder = (accessToken, orderID) => {
  return makeHttpsRequest({
    hostname: PAYPAL_API_HOST,
    path: `/v2/checkout/orders/${orderID}/capture`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
  });
};

const makeHttpsRequest = (options, body) => {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error('Invalid JSON response from PayPal'));
        }
      });
    });
    req.on('error', (err) => reject(err));
    if (body) req.write(body);
    req.end();
  });
};
