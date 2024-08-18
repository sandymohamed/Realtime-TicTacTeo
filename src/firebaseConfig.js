// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBKoHE9Q2jMXQzoZp1dFejxcv4duJAF6ho",
  authDomain: "tictacteo-6ca5c.firebaseapp.com",
  projectId: "tictacteo-6ca5c",
  storageBucket: "tictacteo-6ca5c.appspot.com",
  messagingSenderId: "129337359941",
  appId: "1:129337359941:web:af2356b21cab4181b4ad2c",
  measurementId: "G-CN488J1XQ6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
 export const db = getFirestore(app);



// app.auth().signInAnonymously();
