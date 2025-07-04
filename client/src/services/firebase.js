import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB1h0SE8Uu9lusv0vTbqyllPX3bhN4eZ2U",
  authDomain: "tubes-iot-34150.firebaseapp.com",
  projectId: "tubes-iot-34150",
  storageBucket: "tubes-iot-34150.firebasestorage.app",
  messagingSenderId: "477264615155",
  appId: "1:477264615155:web:c10ee433907bb4c7024986"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth };
export { db }

