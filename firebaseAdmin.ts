import { initializeApp,getApps,getApp, App,cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// const serviceKey = require('@/service_key.json');
const serviceKeyBase64 = process.env.FIREBASE_SERVICE_KEY_BASE64;
if (!serviceKeyBase64) {
  throw new Error('Missing FIREBASE_SERVICE_KEY_BASE64 environment variable');
}

const serviceKeyJson = Buffer.from(serviceKeyBase64, 'base64').toString('utf8');
const serviceAccount = JSON.parse(serviceKeyJson);

let app: App;

if (getApps().length === 0) {
  app = initializeApp({
    credential: cert(serviceAccount),
  });
}else{
    app = getApp();
}

const adminDb = getFirestore(app);
const adminStorage = getStorage(app);

export { app as adminApp , adminDb, adminStorage };