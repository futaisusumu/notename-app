// src/firebase.js
import { initializeApp } from 'firebase/app'
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

export const firebaseConfig = {
    apiKey: "AIzaSyAIc95CgEsloU7KPtRaAHtrklypvKEXUIA",
    authDomain: "notename-app.firebaseapp.com",
    projectId: "notename-app",
    storageBucket: "notename-app.firebasestorage.app",
    messagingSenderId: "1038898374019",
    appId: "1:1038898374019:web:d53578a9e296a73fbcc2b6",
    measurementId: "G-NRL04TB5HW"
}

// Firebase アプリを初期化
const app = initializeApp(firebaseConfig)

// 認証インスタンスを取得し、ローカルストレージに永続化設定
const auth = getAuth(app)
setPersistence(auth, browserLocalPersistence)

// Firestore インスタンスをエクスポート
export const db = getFirestore(app)

// 他のモジュールで使用できるようエクスポート
export { auth }
