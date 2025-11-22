import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBEX8QtIJAXsQzmdQYOmYChHB4SP_O0eaE",
  authDomain: "foraria-ar.firebaseapp.com",
  projectId: "foraria-ar",
  storageBucket: "foraria-ar.firebasestorage.app",
  messagingSenderId: "346785067214",
  appId: "1:346785067214:web:f625198c0ece9a0086e09f"
};

const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);
