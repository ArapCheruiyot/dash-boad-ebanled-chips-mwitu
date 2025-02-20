// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";

import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

  apiKey: "AIzaSyATOdbF-M6uWxwu4KjUXWJ9clomW-VPFMQ",

  authDomain: "nth-weft-446512-g5.firebaseapp.com",

  projectId: "nth-weft-446512-g5",

  storageBucket: "nth-weft-446512-g5.firebasestorage.app",

  messagingSenderId: "534160681000",

  appId: "1:534160681000:web:7b20e51d700df2fc90ad1d",

  measurementId: "G-NMBJ57GD08"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);
