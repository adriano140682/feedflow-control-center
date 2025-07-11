// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuração do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDkb9hx58oPEynIkqKaKiflO1113IDzyuI",
  authDomain: "bdnovo-bb81f.firebaseapp.com",
  projectId: "bdnovo-bb81f",
  storageBucket: "bdnovo-bb81f.appspot.com",
  messagingSenderId: "198891935516",
  appId: "1:198891935516:web:52c61286c6961b6a1f0cd9"
};

// Inicializa o Firebase e o Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
