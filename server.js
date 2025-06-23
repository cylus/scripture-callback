const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

// Middleware
app.use(bodyParser.json());

// Firebase Admin Initialization using .env variables
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
  }),
});

const db = admin.firestore();

// Callback Endpoint
app.post('/azam-callback', async (req, res) => {
  const data = req.body;

  console.log("Callback received from AzamPay:", data);

  const {
    msisdn,
    amount,
    message,
    utilityref,
    operator,
    reference,
    transactionstatus,
    submerchantAcc,
    fspReferenceId,
    additionalProperties
  } = data;

  try {
    if (transactionstatus === "success") {
      // Save successful payment
      await db.collection('payments').add({
        msisdn,
        amount,
        message,
        bookId: utilityref,        // Book ID
        provider: operator,
        transactionId: reference,
        status: transactionstatus,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log('✅ Payment recorded for book:', utilityref);
    } else {
      console.warn('❌ Payment failed for:', utilityref);
    }

    res.status(200).json({ message: 'Callback processed successfully' });
  } catch (error) {
    console.error("Error handling callback:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`AzamPay Callback server running on port ${port}`);
});







// const express = require('express');
// const admin = require('firebase-admin');
// const bodyParser = require('body-parser');
// require('dotenv').config();

// const app = express();
// const port = process.env.PORT || 3000;

// // Middleware
// app.use(bodyParser.json());

// // Firebase Admin Initialization
// admin.initializeApp({
//   credential: admin.credential.cert(require('./serviceAccountKey.json')),
// });
// const db = admin.firestore();

// // Callback Endpoint
// app.post('/azam-callback', async (req, res) => {
//   const data = req.body;

//   console.log("Callback received from AzamPay:", data);

//   const {
//     msisdn,
//     amount,
//     message,
//     utilityref,
//     operator,
//     reference,
//     transactionstatus,
//     submerchantAcc,
//     fspReferenceId,
//     additionalProperties
//   } = data;

//   try {
//     if (transactionstatus === "success") {
//       // Save successful payment
//       await db.collection('payments').add({
//         msisdn,
//         amount,
//         message,
//         bookId: utilityref,        // Book ID
//         provider: operator,
//         transactionId: reference,
//         status: transactionstatus,
//         createdAt: admin.firestore.FieldValue.serverTimestamp(),
//       });

//       console.log('✅ Payment recorded for book:', utilityref);
//     } else {
//       console.warn('❌ Payment failed for:', utilityref);
//     }

//     res.status(200).json({ message: 'Callback processed successfully' });
//   } catch (error) {
//     console.error("Error handling callback:", error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });

// app.listen(port, () => {
//   console.log(`AzamPay Callback server running on port ${port}`);
// });
