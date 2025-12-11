const express = require('express');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

// ✅ Check if Firebase env variable exists
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT not set');
  process.exit(1);
}

// ✅ Parse Firebase service account JSON
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} catch (err) {
  console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT:', err.message);
  process.exit(1);
}

// ✅ Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// ✅ API endpoint to send notification
app.post('/send-sos', async (req, res) => {
  const { token, title, body, data } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const message = {
    token,
    notification: { title, body },
    data: {
      ...data,
      click_action: 'FLUTTER_NOTIFICATION_CLICK',
      screen: 'notifications',
    },
    android: { notification: { channelId: 'high_importance_channel', priority: 'high' } },
    apns: { payload: { aps: { sound: 'default' } } },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ Notification sent:', response);
    res.json({ success: true, messageId: response });
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Keep server alive
app.get('/', (req, res) => res.send('Backend running...'));
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
