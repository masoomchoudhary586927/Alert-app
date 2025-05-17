import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDeJUn1VlBFXek2FcZAb93_i3UDNXgiS_E",
  authDomain: "minor-project-eaad0.firebaseapp.com",
  databaseURL: "https://minor-project-eaad0-default-rtdb.firebaseio.com",
  projectId: "minor-project-eaad0",
  storageBucket: "minor-project-eaad0.appspot.com",  // <- corrected bucket URL
  messagingSenderId: "288719096280",
  appId: "1:288719096280:web:c2a59df787e13fb7698aad"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // for Firebase Storage

export { app, auth, db, storage };
