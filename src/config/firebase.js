import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvAhbYWlSpftKIYviuZGPqCsIjQv6BuGI",
  authDomain: "fir-bd-cbc0e.firebaseapp.com",
  projectId: "fir-bd-cbc0e",
  storageBucket: "fir-bd-cbc0e.appspot.com",
  messagingSenderId: "534203128170",
  appId: "1:534203128170:web:72196a93956d7348ba6d13"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export { auth };

