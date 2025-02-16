// Firebase SDK laden via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 🔹 Firebase configuratie
const firebaseConfig = {
    apiKey: "AIzaSyAgT_uX_5RrP7CKiI5-KpBSUXvvT928qik",
    authDomain: "wandeltracker-3692d.firebaseapp.com",
    projectId: "wandeltracker-3692d",
    storageBucket: "wandeltracker-3692d.firebasestorage.app",
    messagingSenderId: "131040578819",
    appId: "1:131040578819:web:1aabbd1272a76fdc232d36"
};

// 🔹 Firebase initialiseren
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// 🔹 Google Login functie
document.getElementById("google-login-btn").addEventListener("click", async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // Sla gebruiker op in Firestore
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            displayName: user.displayName
        }, { merge: true });

        alert("Ingelogd als: " + user.displayName);
    } catch (error) {
        alert("Fout bij Google login: " + error.message);
    }
});

// 🔹 Uitloggen functie
document.getElementById("logout-btn").addEventListener("click", async () => {
    try {
        await signOut(auth);
        alert("Uitgelogd!");
    } catch (error) {
        alert("Fout bij uitloggen: " + error.message);
    }
});

// 🔹 Controleer of gebruiker ingelogd is
onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById("login-container").style.display = "none";
        document.getElementById("main-content").style.display = "block";
        document.getElementById("user-info").innerText = "Ingelogd als: " + user.displayName;

        // Controleer of gebruiker al een startlocatie heeft
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            // Voeg standaardstructuur toe als de gebruiker nieuw is
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                displayName: user.displayName,
                startLocation: null,
                history: {}
            });
        }
    } else {
        document.getElementById("login-container").style.display = "block";
        document.getElementById("main-content").style.display = "none";
    }
});
