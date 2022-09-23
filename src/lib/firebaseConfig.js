// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBJwL2ReLgrGnXN8IlKbepumt2jDVpXBlw",
  authDomain: "fantasy-pool-b3361.firebaseapp.com",
  projectId: "fantasy-pool-b3361",
  storageBucket: "fantasy-pool-b3361.appspot.com",
  messagingSenderId: "515381360387",
  appId: "1:515381360387:web:ed0a7495935d78f3abdb36",
  measurementId: "G-4CSTMNQV1R"
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
const analytics = getAnalytics(app);

if (location.hostname === "127.0.0.1" || location.hostname ==="localhost") {
  console.log("dev-env")
  connectStorageEmulator(storage, "localhost", 9199, { disableWarnings: true });
  connectFirestoreEmulator(db, "localhost", 8080, { disableWarnings: true });
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  // connectFunctionsEmulator(functions, "localhost", 5001, { disableWarnings: false });
}