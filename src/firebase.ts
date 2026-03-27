import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBufKt1I2nnKIdqBYzLmuGwNIv2rWbFJUE",
  authDomain: "whatsapp-channel-chat.firebaseapp.com",
  databaseURL: "https://whatsapp-channel-chat-default-rtdb.firebaseio.com",
  projectId: "whatsapp-channel-chat",
  storageBucket: "whatsapp-channel-chat.firebasestorage.app",
  messagingSenderId: "906974342849",
  appId: "1:906974342849:web:aa9d7db7aaa69ed2da2e40",
  measurementId: "G-G7J2JNMPDD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
