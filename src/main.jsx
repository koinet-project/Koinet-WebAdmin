import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router'
import { initializeApp } from "firebase/app"
import { getDatabase } from "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyBqIYHc6JyBza8g3l76JZYcp9hZnjZgzXs",
  authDomain: "koinet-8bbee.firebaseapp.com",
  databaseURL: "https://koinet-8bbee-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "koinet-8bbee",
  storageBucket: "koinet-8bbee.firebasestorage.app",
  messagingSenderId: "596021573781",
  appId: "1:596021573781:web:6e16ceb1fa720dab02439c",
  measurementId: "G-MV2GYRNCVV"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
