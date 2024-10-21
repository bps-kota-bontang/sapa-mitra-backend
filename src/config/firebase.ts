import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let firestoreInstance: Firestore | null = null;

const initializeFirestore = (): Firestore => {
  if (!firestoreInstance) {
    const serviceAccount = require("./../../service-account.json");
    const app = initializeApp({
      credential: cert(serviceAccount),
    });
    firestoreInstance = getFirestore(app);
  }
  return firestoreInstance;
};

export default initializeFirestore;
