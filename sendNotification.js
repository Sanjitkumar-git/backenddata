const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(require('./firebase-service-account.json')),
});

async function sendNotification(token, title, body, data = {}) {
  const message = {
    token: token,
    notification: {
      title: title,
      body: body,
    },
    data: {
      ...data,
      click_action: 'FLUTTER_NOTIFICATION_CLICK',
      screen: 'notifications',
    },
    android: {
      notification: {
        channelId: 'high_importance_channel',
        priority: 'high',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
        },
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ Notification sent successfully:', response);
  } catch (error) {
    console.error('❌ Error sending notification:', error);
  }
}

// 👉 यहाँ तुम्हारा Flutter से मिला FCM token डालो
const targetToken = 'dKf2kJiaQTaPOCS6PXLSq5:APA91bHyJnfg-eK3VTltdv83Um97ZUK3xKmBesYuseGKX7tfI1nxVLSnfLDR4psnR5rtOYLCUb2qM-9sIhialaXvO9ScvpRyGiUOiYbhv08YpWIi7afEerA';

sendNotification(
  targetToken,
  '🚨 SOS Alert',
  'User needs help at given location!',
  { from_uid: 'abc123', location: '[28.3493347° N, 77.0903525° E]' }
);
