import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCmnsdVaMMyvQByxHuHMjdGEKBjRHj9D2Q",
    authDomain: "chat-with-pdf-d8f43.firebaseapp.com",
    projectId: "chat-with-pdf-d8f43",
    storageBucket: "chat-with-pdf-d8f43.appspot.com",
    messagingSenderId: "984782841754",
    appId: "1:984782841754:web:da215452e437dba6dd7c23"
  };

  const app = getApps().length===0 ?  initializeApp(firebaseConfig) : getApp();

  const db = getFirestore(app);
  const storage = getStorage(app);

  export {db, storage};