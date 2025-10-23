// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAsINOQJO-JZBxLfOTZebbIX-b8AAvLMx0",
  authDomain: "gradea-16e92.firebaseapp.com",
  databaseURL: "https://gradea-16e92-default-rtdb.firebaseio.com",
  projectId: "gradea-16e92",
  storageBucket: "gradea-16e92.firebasestorage.app",
  messagingSenderId: "997063193649",
  appId: "1:997063193649:web:3cd18734390b80982d1110",
  measurementId: "G-PJSBKFP1Y9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
