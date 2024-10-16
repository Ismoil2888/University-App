// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDW06pRWxVfbFwO4J9OYI9ANMPMbTf-mrM",
  authDomain: "university-app-ff9e7.firebaseapp.com",
  projectId: "university-app-ff9e7",
  storageBucket: "university-app-ff9e7.appspot.com",
  messagingSenderId: "85413455839",
  appId: "1:85413455839:web:49dcbd7e1b1cee9f15466a",
  measurementId: "G-7FXQJVDK64",
  databaseURL: "https://university-app-ff9e7-default-rtdb.firebaseio.com/" // Убедитесь, что это указано
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Получение Firestore базы данных
const db = getFirestore(app);

// Включение оффлайн-поддержки
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.log('Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.log('Persistence is not available in this browser');
    }
  });
  

export { db };