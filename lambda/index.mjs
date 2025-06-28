import { getPayPalToken, createPayPalOrder, capturePayPalOrder } from './paypal.mjs';
import { recordTransaction } from './dbHandler.mjs';
import { generateDownloadLink } from './downloadLinkGenerator.mjs';
import { sendEmailNotification } from './emailNotifier.mjs';

const programCatalog = {
  'Email & Text Hash Generator Pro 1.0': { price: 19.99, s3Key: 'email-text-hash-generator-pro-1.0/Email & Text Hash Generator Pro.exe', sku: 'email-text-hash-generator-pro-1.0' },
  'MD5 & SHA Checksum Utility Pro 2.1': { price: 9.99, s3Key: 'md5-sha-checksum-utility-pro-2.1/setup.exe', sku: 'md5-sha-checksum-utility-pro-2.1' },
  'MD5 & SHA Checksum Utility Pro 3.0': { price: 19.99, s3Key: 'md5-sha-checksum-utility-pro-3.0/checksum.exe', sku: 'md5-sha-checksum-utility-pro-3.0' },
  'MD5 & SHA Checksum Utility Pro 3.0 (Existing Customer Upgrade)': { price: 10.00, s3Key: 'md5-sha-checksum-utility-pro-3.0/checksum.exe', sku: 'md5-sha-checksum-utility-pro-3.0-existing-upgrade' },
};

export const handler = async (event) => {
  try {
    const { path, body } = event;
    const parsedBody = JSON.parse(body || '{}');
    const { mode, programName, orderID } = parsedBody;
    const tokenData = await getPayPalToken();

    if (mode === 'create') {
      const program = programCatalog[programName];
      if (!program) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid program name' }) };
      }

      // Step 1: Create order
      const order = await createPayPalOrder(tokenData.access_token, programName, program.sku, program.price);
      const approvalUrl = order.links.find(link => link.rel === 'approve')?.href;

      if (!approvalUrl) throw new Error('PayPal approval URL not found');
      return { statusCode: 200, body: JSON.stringify({ approvalUrl }) };
    }

    if (mode === 'capture') {
      // Step 2: Capture order
      const capturedOrder = await capturePayPalOrder(tokenData.access_token, orderID);
      if (!capturedOrder || !capturedOrder.payer?.email_address) {
        throw new Error('Incomplete order details received after capture');
      }

      const purchaseUnit = capturedOrder.purchase_units[0];
      const capturedProgramName = purchaseUnit.reference_id;
      const expectedAmount = programCatalog[capturedProgramName]?.price.toFixed(2);
      const actualAmount = purchaseUnit.payments.captures[0].amount.value;

      if (expectedAmount !== actualAmount) {
        throw new Error(`Payment amount mismatch: expected ${expectedAmount}, received ${actualAmount}`);
      }

      const transactionID = purchaseUnit.payments.captures[0].id;
      const payerEmail = capturedOrder.payer.email_address;
      const purchaseTimestamp = new Date().toISOString();

      await recordTransaction({
        transactionID,
        email: payerEmail,
        programName: capturedProgramName,
        purchaseTimestamp
      });

      const program = programCatalog[capturedProgramName];
      const downloadLink = await generateDownloadLink(program.s3Key);
      await sendEmailNotification(payerEmail, capturedProgramName, downloadLink);

      return {
        statusCode: 200,
        body: JSON.stringify({
          downloadLink,
          transactionID,
          amount: parseFloat(actualAmount),
          programName: capturedProgramName,
          sku: programCatalog[capturedProgramName].sku
        })
      };
    }

    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid mode' }) };
  } catch (err) {
    console.error('Error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
