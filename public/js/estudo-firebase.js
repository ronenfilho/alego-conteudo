// Firebase operations module
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export let auth = null;
export let db = null;

export function initializeFirebase() {
    const firebaseConfig = {
        apiKey: "AIzaSyDj6lAZJpgB2exLYYrrhNSW2I8Y4Oa7JNo",
        authDomain: "alego-conteudo.firebaseapp.com",
        projectId: "alego-conteudo",
        storageBucket: "alego-conteudo.firebasestorage.app",
        messagingSenderId: "820746648654",
        appId: "1:820746648654:web:81e29e1fd5e99e5e8c3d2c"
    };
    
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    return { auth, db };
}

export async function loadFromFirebase(userId, processId) {
    try {
        const docRef = doc(db, 'users', userId, 'processes', processId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                progressData: data.data || {},
                timers: data.timers || {}
            };
        }
        return { progressData: {}, timers: {} };
    } catch (error) {
        console.error('Erro ao carregar do Firebase:', error);
        return { progressData: {}, timers: {} };
    }
}

export async function saveToFirebase(userId, processId, progressData, timers) {
    try {
        const docRef = doc(db, 'users', userId, 'processes', processId);
        await setDoc(docRef, {
            data: progressData,
            timers: timers,
            updatedAt: serverTimestamp()
        }, { merge: true });
        return true;
    } catch (error) {
        console.error('Erro ao salvar no Firebase:', error);
        return false;
    }
}
